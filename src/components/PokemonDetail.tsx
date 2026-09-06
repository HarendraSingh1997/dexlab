import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { ChevronLeft, ChevronRight, Dna, Heart, Ruler, Swords, Volume2, Weight, Zap } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { artwork, dexId, title, TYPE_AURA, type Pokemon } from '@/lib/types'
import { flavorText } from '@/lib/pokeapi'
import { usePokemonSpecies } from '@/hooks/usePokemon'
import { prefersReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { TypeBadge } from './TypeBadge'

interface Props {
  pokemon: Pokemon | null
  isFav: boolean
  onToggleFav: (id: number) => void
  onClose: () => void
  /** Step through the dossier (1 = next, -1 = previous). Omitted when there's nothing to step through. */
  onNavigate?: (dir: 1 | -1) => void
  /** e.g. "04 / 128" — position of this dossier in the browse order */
  navLabel?: string | null
}

const STAT_LABEL: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
}

export function PokemonDetail({ pokemon, isFav, onToggleFav, onClose, onNavigate, navLabel }: Props) {
  const { data: species, isPending: speciesPending } = usePokemonSpecies(pokemon?.species.url)
  const artRef = useRef<HTMLImageElement>(null)
  const [imgReady, setImgReady] = useState(false)

  useEffect(() => {
    setImgReady(false)
  }, [pokemon?.id])

  // arrow keys step through dossiers, mirroring the on-screen arrows
  useEffect(() => {
    if (!pokemon || !onNavigate) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onNavigate(-1)
      else if (e.key === 'ArrowRight') onNavigate(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pokemon, onNavigate])

  // anime.js 3D dossier entrance: the specimen spins in on open / change
  useEffect(() => {
    if (!pokemon || !artRef.current || prefersReducedMotion()) return
    const a = animate(artRef.current, {
      scale: [0.5, 1],
      rotateY: [-100, 0],
      opacity: [0, 1],
      duration: 900,
      ease: 'outExpo',
    })
    return () => {
      a.revert()
    }
  }, [pokemon])

  const primary = pokemon?.types[0]?.type.name ?? 'normal'
  const aura = TYPE_AURA[primary] ?? TYPE_AURA.normal
  const bst = pokemon?.stats.reduce((a, s) => a + s.base_stat, 0) ?? 0

  return (
    <Dialog open={!!pokemon} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0">
        {pokemon && (
          <div className="max-h-[calc(92vh-60px)] overflow-y-auto">
            {/* dossier header with aura */}
            <div className={cn('relative overflow-hidden bg-gradient-to-b px-6 pb-5 pt-8', aura)}>
              <div className="absolute inset-0 dex-grid-bg opacity-40" />
              <div className="relative flex flex-col items-center text-center sm:flex-row sm:text-left gap-5">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 scale-110 rounded-full bg-chip blur-2xl" />
                  {!imgReady && (
                    <Skeleton className="absolute inset-0 m-auto size-28 rounded-full sm:size-36" />
                  )}
                  <img
                    ref={artRef}
                    src={artwork(pokemon)}
                    alt={pokemon.name}
                    onLoad={() => setImgReady(true)}
                    className="relative size-40 object-contain drop-shadow-[0_24px_36px_rgba(0,0,0,.6)] sm:size-48"
                  />
                </div>
                <div className="flex-1">
                  <DialogHeader className="items-center sm:items-start p-0">
                    <span className="font-mono text-xs font-semibold tracking-[0.3em] text-ink/50">
                      {dexId(pokemon.id)} · {pokemon.species.name.toUpperCase()} LINE
                    </span>
                    <DialogTitle className="text-4xl">{title(pokemon.name)}</DialogTitle>
                  </DialogHeader>
                  {speciesPending ? (
                    <Skeleton className="mx-auto mt-1 h-3 w-44 rounded-full sm:mx-0" />
                  ) : (
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-ink/40">
                      {species?.genera.find((g) => g.language.name === 'en')?.genus ?? 'Pokémon'}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                    {pokemon.types.map((t) => (
                      <TypeBadge key={t.type.name} type={t.type.name} size="md" />
                    ))}
                    {species?.is_legendary && <Badge variant="volt">Legendary</Badge>}
                    {species?.is_mythical && <Badge variant="signal">Mythical</Badge>}
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                    <Button size="sm" variant={isFav ? 'default' : 'secondary'} onClick={() => onToggleFav(pokemon.id)}>
                      <Heart className={cn('size-3.5', isFav && 'fill-current')} />
                      {isFav ? 'Favorited' : 'Favorite'}
                    </Button>
                    {pokemon.cries?.latest && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => new Audio(pokemon.cries!.latest!).play().catch(() => {})}
                      >
                        <Volume2 /> Cry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              {/* vitals strip */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 -mt-1">
                {[
                  { icon: Ruler, label: 'Height', value: `${(pokemon.height / 10).toFixed(1)} m` },
                  { icon: Weight, label: 'Weight', value: `${(pokemon.weight / 10).toFixed(1)} kg` },
                  { icon: Zap, label: 'Base XP', value: String(pokemon.base_experience ?? '—') },
                  { icon: Dna, label: 'Base total', value: String(bst) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-2xl border border-line bg-chip p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">
                      <Icon className="size-3.5" /> {label}
                    </div>
                    <div className="mt-1 font-display text-lg font-bold">{value}</div>
                  </div>
                ))}
              </div>

              {speciesPending ? (
                <div className="mt-4 space-y-2 rounded-2xl border border-line bg-chip p-4">
                  <Skeleton className="h-3 w-full rounded-full" />
                  <Skeleton className="h-3 w-5/6 rounded-full" />
                </div>
              ) : (
                species &&
                flavorText(species) && (
                  <p className="mt-4 rounded-2xl border border-[#FFD02F]/20 bg-[#FFD02F]/[.06] p-4 text-sm leading-relaxed text-ink/80">
                    “{flavorText(species)}”
                  </p>
                )
              )}

              <Tabs defaultValue="stats" className="mt-4">
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="abilities">Abilities</TabsTrigger>
                  <TabsTrigger value="moves">Moves · {pokemon.moves.length}</TabsTrigger>
                </TabsList>

                <TabsContent value="stats" className="space-y-3">
                  {pokemon.stats.map((s) => (
                    <div key={s.stat.name} className="grid grid-cols-[86px_44px_1fr] items-center gap-3">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-ink/55">
                        {STAT_LABEL[s.stat.name] ?? s.stat.name}
                      </span>
                      <span className="font-mono text-sm font-bold text-right">{s.base_stat}</span>
                      <Progress value={Math.min(100, (s.base_stat / 180) * 100)} />
                    </div>
                  ))}
                  <p className="pt-1 font-mono text-[11px] text-ink/40">
                    EFFORT VALUES ·{' '}
                    {pokemon.stats.filter((s) => s.effort > 0).map((s) => `${s.effort} ${s.stat.name}`).join(', ') || 'none'}
                  </p>
                </TabsContent>

                <TabsContent value="abilities" className="space-y-2">
                  {pokemon.abilities.map((a) => (
                    <div
                      key={a.ability.name}
                      className="flex items-center justify-between rounded-xl border border-line bg-chip px-4 py-3"
                    >
                      <span className="text-sm font-semibold capitalize">{a.ability.name.replace(/-/g, ' ')}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">slot {a.slot}</Badge>
                        {a.is_hidden && <Badge variant="volt">hidden</Badge>}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="moves">
                  <div className="grid max-h-64 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                    {pokemon.moves.slice(0, 60).map((m) => (
                      <div
                        key={m.move.name}
                        className="flex items-center gap-2 rounded-lg border border-line bg-chip px-3 py-2 text-[13px] capitalize text-ink/75"
                      >
                        <Swords className="size-3.5 shrink-0 text-[#FF3355]/70" />
                        {m.move.name.replace(/-/g, ' ')}
                      </div>
                    ))}
                  </div>
                  {pokemon.moves.length > 60 && (
                    <p className="mt-2 font-mono text-[11px] text-ink/40">
                      + {pokemon.moves.length - 60} more in full learnset
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
        {pokemon && onNavigate && (
          <div className="flex items-center justify-between gap-2 border-t border-line bg-console px-4 py-3">
            <Button size="sm" variant="outline" onClick={() => onNavigate(-1)}>
              <ChevronLeft /> Prev
            </Button>
            {navLabel && (
              <span className="font-mono text-[11px] tracking-[0.25em] text-ink/50">
                {navLabel}
              </span>
            )}
            <Button size="sm" variant="outline" onClick={() => onNavigate(1)}>
              Next <ChevronRight />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
