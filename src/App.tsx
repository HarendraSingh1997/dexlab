import { useEffect, useRef, useState } from 'react'
import {
  ArrowDownWideNarrow,
  FlaskConical,
  Heart,
  Loader2,
  Moon,
  Radar,
  Search,
  Shuffle,
  Sun,
  TriangleAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PokemonCard } from '@/components/PokemonCard'
import { PokemonDetail } from '@/components/PokemonDetail'
import { HeroSpotlight } from '@/components/HeroSpotlight'
import { TypeBadge } from '@/components/TypeBadge'
import { TOTAL, usePokemonList, usePokemonSearch, useSurprisePokemon } from '@/hooks/usePokemon'
import { useTheme } from '@/hooks/useTheme'
import { ALL_TYPES, type Pokemon } from '@/lib/types'
import { cn } from '@/lib/utils'

function loadFavs(): number[] {
  try {
    return JSON.parse(localStorage.getItem('dexlab:favs') ?? '[]')
  } catch {
    return []
  }
}

/** Read the deep-linked `?search=` param (mirrors the Next.js app's URL shape) */
function initialSearchParam(): string {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('search')?.trim() ?? ''
}

/** Push the search term into the URL without reloading */
function writeSearchParam(value: string) {
  const url = new URL(window.location.href)
  const term = value.trim()
  if (term) url.searchParams.set('search', term)
  else url.searchParams.delete('search')
  window.history.replaceState(null, '', url)
}

export default function App() {
  const [query, setQuery] = useState(initialSearchParam)
  const [submitted, setSubmitted] = useState(initialSearchParam)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [sort, setSort] = useState<'id' | 'name' | 'bst'>('id')
  const [favsOnly, setFavsOnly] = useState(false)
  const [favs, setFavs] = useState<number[]>(loadFavs)
  const [selected, setSelected] = useState<Pokemon | null>(null)
  const { theme, toggle: toggleTheme } = useTheme()

  const isSearching = submitted.trim().length > 0

  const list = usePokemonList()
  const search = usePokemonSearch(submitted)
  const getSurprise = useSurprisePokemon()

  const items = isSearching
    ? search.data
      ? [search.data]
      : []
    : (list.data?.pages.flatMap((p) => p.results) ?? [])
  const total = list.data?.pages[0]?.count ?? TOTAL
  const loading = !isSearching && list.isPending
  const searching = isSearching && search.isPending
  const loadingMore = list.isFetchingNextPage
  const error = isSearching
    ? search.isError
      ? `No specimen found for “${submitted.trim()}”. Try a name or dex number 1–${TOTAL}.`
      : null
    : list.isError
      ? (list.error?.message ?? 'Failed to reach PokeAPI')
      : null

  // Resolve the selected dossier: prefer the live object (card click /
  // surprise fetch), which always carries full detail data.
  const selectedLive = selected ? (items.find((p) => p.id === selected.id) ?? selected) : null

  const favSet = new Set(favs)
  const sentinel = useRef<HTMLDivElement>(null)

  const toggleFav = (id: number) => {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      localStorage.setItem('dexlab:favs', JSON.stringify(next))
      return next
    })
  }

  // infinite scroll → next TanStack Query page
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isSearching && list.hasNextPage && !list.isFetchingNextPage) {
          void list.fetchNextPage()
        }
      },
      { rootMargin: '600px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [isSearching, list.hasNextPage, list.isFetchingNextPage, list.fetchNextPage, items.length])

  // direct search (name or id) — the query fires via `enabled`;
  // the term is mirrored to `?search=` so results are shareable, like the
  // Next.js app's search endpoint
  const onSearch = () => {
    setSubmitted(query)
    writeSearchParam(query)
  }
  const clearSearch = () => {
    setQuery('')
    setSubmitted('')
    writeSearchParam('')
  }

  // back/forward navigation restores the search from the URL
  useEffect(() => {
    const sync = () => {
      const term = initialSearchParam()
      setQuery(term)
      setSubmitted(term)
    }
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  // ⌘K / Ctrl+K focuses the search bar (whichever breakpoint is visible)
  const searchRefs = useRef<(HTMLInputElement | null)[]>([])
  useEffect(() => {
    if (selected) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const visible = searchRefs.current.find((el) => el && el.offsetParent !== null)
        visible?.focus()
        visible?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  function blurOnEscape(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') e.currentTarget.blur()
  }

  const visible = (() => {
    let bunch = items
    if (typeFilter) bunch = bunch.filter((p) => p.types.some((t) => t.type.name === typeFilter))
    if (favsOnly) bunch = bunch.filter((p) => favSet.has(p.id))
    const sorted = [...bunch]
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'bst')
      sorted.sort(
        (a, b) => b.stats.reduce((x, s) => x + s.base_stat, 0) - a.stats.reduce((x, s) => x + s.base_stat, 0),
      )
    else sorted.sort((a, b) => a.id - b.id)
    return sorted
  })()

  // dossier pager: step through the current browse order (visible grid when the
  // selection belongs to it, otherwise the full loaded collection), wrapping around
  const navList =
    selectedLive && visible.some((p) => p.id === selectedLive.id) ? visible : items
  const navigate = (dir: 1 | -1) => {
    if (!selectedLive || navList.length < 2) return
    const idx = navList.findIndex((p) => p.id === selectedLive.id)
    setSelected(navList[(idx + dir + navList.length) % navList.length])
  }
  const navLabel = (() => {
    if (!selectedLive || navList.length < 2) return null
    const pos = navList.findIndex((p) => p.id === selectedLive.id) + 1
    return `${String(pos).padStart(2, '0')} / ${navList.length}`
  })()

  const surprise = () => {
    void getSurprise()
      .then((p) => setSelected(p))
      .catch(() => {})
  }

  return (
    <div className="min-h-screen bg-abyss text-ink">
      {/* ── command bar ─────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-line bg-abyss/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-9 items-center justify-center rounded-xl bg-[#FF3355] shadow-[0_8px_24px_rgba(255,51,85,.45)]">
              <span className="absolute h-[3px] w-full bg-abyss/80" />
              <span className="relative size-3 rounded-full border-[3px] border-white bg-abyss" />
            </span>
            <div className="leading-none">
              <div className="font-display text-lg font-bold tracking-tight">
                DEX<span className="text-[#FF3355]">LAB</span>
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-ink/40">
                field research
              </div>
            </div>
          </div>

          <form
            className="relative mx-auto hidden w-full max-w-md md:block"
            onSubmit={(e) => {
              e.preventDefault()
              onSearch()
            }}
          >
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
            <Input
              ref={(el) => {
                searchRefs.current[0] = el
              }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={blurOnEscape}
              placeholder="Search name or dex № — e.g. bulbasaur, 25, gengar…"
              className="pl-10 pr-12"
              aria-label="Search Pokémon"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-line bg-chip px-1.5 py-0.5 font-mono text-[10px] text-ink/50">
              ⌘K
            </kbd>
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun /> : <Moon />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setFavsOnly((v) => !v)} className={cn(favsOnly && 'text-rose bg-[#FF3355]/15')}>
              <Heart className={cn('size-4', favsOnly && 'fill-current')} />
              <span className="hidden sm:inline">{favs.length}</span>
            </Button>
            <Button variant="volt" size="sm" onClick={surprise}>
              <Shuffle /> <span className="hidden sm:inline">Surprise me</span>
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 md:hidden">
          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault()
              onSearch()
            }}
          >
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
            <Input
              ref={(el) => {
                searchRefs.current[1] = el
              }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={blurOnEscape}
              placeholder="Search name or №…"
              className="pl-10"
              aria-label="Search Pokémon"
            />
          </form>
        </div>
      </header>

      {/* ── hero: the thesis ────────────────────────── */}
      <section className="dex-grid-bg relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.45fr_.55fr] lg:py-16">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-gold">
              <span className="pulse-ring inline-block size-2 rounded-full bg-[#34D399]" />
              Live link · PokeAPI · {total.toLocaleString()} specimens
            </div>
            <h1 className="font-display mt-4 text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
              Every specimen,
              <br />
              catalogued like
              <br />
              <span className="bg-gradient-to-r from-[#FF3355] via-[#FFD02F] to-[#38BDF8] bg-clip-text text-transparent">
                field evidence.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink/60">
              A research-terminal Pokédex. Filter by type signature, audition cries, open a
              dossier for stats, abilities and the full learnset — built on live{' '}
              <span className="font-mono text-ink/80">pokeapi.co</span> data.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="lg" onClick={() => document.getElementById('grid')?.scrollIntoView({ behavior: 'smooth' })}>
                <Radar /> Open the collection
              </Button>
              <Button size="lg" variant="secondary" onClick={surprise}>
                <FlaskConical /> Random specimen
              </Button>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-2">
              {[
                { k: 'Catalogued', v: String(total) },
                { k: 'Favorited', v: String(favs.length) },
                { k: 'In view', v: String(visible.length) },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-line bg-chip p-3 backdrop-blur">
                  <div className="font-display text-2xl font-bold">{s.v}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40">{s.k}</div>
                </div>
              ))}
            </div>
          </div>

          {/* hero specimen carousel */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-[#FF3355]/25 via-transparent to-[#38BDF8]/15 blur-2xl" />
            <HeroSpotlight items={items} onSelect={setSelected} />
          </div>
        </div>
      </section>

      {/* ── filter console ──────────────────────────── */}
      <div id="grid" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-8 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTypeFilter(null)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest transition cursor-pointer',
              !typeFilter
                ? 'border-[#FF3355]/60 bg-[#FF3355]/15 text-ink'
                : 'border-line bg-chip text-ink/50 hover:text-ink hover:border-ink/30',
            )}
          >
            all types
          </button>
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter((f) => (f === t ? null : t))}
              className={cn(
                'rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest transition cursor-pointer',
                typeFilter === t
                  ? 'border-[#FFD02F]/60 bg-[#FFD02F]/15 text-ink'
                  : 'border-line bg-chip text-ink/50 hover:text-ink hover:border-ink/30',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant={sort === 'id' ? 'signal' : 'outline'} className="cursor-pointer" onClick={() => setSort('id')}>
            <ArrowDownWideNarrow className="size-3" /> dex №
          </Badge>
          <Badge variant={sort === 'name' ? 'signal' : 'outline'} className="cursor-pointer" onClick={() => setSort('name')}>
            A–Z
          </Badge>
          <Badge variant={sort === 'bst' ? 'signal' : 'outline'} className="cursor-pointer" onClick={() => setSort('bst')}>
            strongest
          </Badge>
          {typeFilter && (
            <span className="ml-1">
              <TypeBadge type={typeFilter} />
            </span>
          )}
          {submitted.trim() || query.trim() ? (
            <Button size="sm" variant="secondary" onClick={clearSearch}>
              Clear search
            </Button>
          ) : null}
        </div>
      </div>

      {/* ── grid ────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {(loading || searching) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-line bg-console/90 p-4">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-4 w-14 rounded-full" />
                  <Skeleton className="size-7 rounded-full" />
                </div>
                <Skeleton className="mx-auto mt-2 size-36 rounded-2xl" />
                <Skeleton className="mt-3 h-5 w-1/2 rounded-full" />
                <div className="mt-2 flex gap-1.5">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="mt-3 flex justify-between border-t border-line pt-3">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-3 w-12 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-[#FF3355]/30 bg-[#FF3355]/[.07] px-6 py-16 text-center">
            <TriangleAlert className="size-8 text-[#FF3355]" />
            <p className="max-w-md text-sm text-ink/70">{error}</p>
            <Button onClick={() => (isSearching ? search.refetch() : list.refetch())}>Reconnect to PokeAPI</Button>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-chip px-6 py-16 text-center">
            <Search className="size-8 text-ink/30" />
            <p className="max-w-md text-sm text-ink/60">
              No specimens match this combination. Clear the type filter or search a different
              name or number.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setTypeFilter(null)
                setFavsOnly(false)
                clearSearch()
              }}
            >
              Reset console
            </Button>
          </div>
        )}

        {!loading && visible.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((p, i) => (
              <PokemonCard
                key={p.id}
                pokemon={p}
                index={i}
                isFav={favSet.has(p.id)}
                onToggleFav={toggleFav}
                onSelect={setSelected}
              />
            ))}
          </div>
        )}

        <div ref={sentinel} className="flex justify-center py-10">
          {loadingMore && (
            <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-ink/40">
              <Loader2 className="size-4 animate-spin" /> trawling tall grass…
            </span>
          )}
          {!isSearching && !loading && list.hasNextPage && !loadingMore && (
            <Button variant="outline" onClick={() => list.fetchNextPage()}>
              Load more specimens
            </Button>
          )}
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/35 sm:flex-row sm:px-6">
          <span>DEXLAB · React 19 · TanStack Query · shadcn/ui · Tailwind v4</span>
          <span>
            Data + sprites · <span className="text-ink/55">pokeapi.co</span>
          </span>
        </div>
      </footer>

      <PokemonDetail
        pokemon={selectedLive}
        isFav={selectedLive ? favSet.has(selectedLive.id) : false}
        onToggleFav={toggleFav}
        onClose={() => setSelected(null)}
        onNavigate={navList.length > 1 ? navigate : undefined}
        navLabel={navLabel}
      />
    </div>
  )
}
