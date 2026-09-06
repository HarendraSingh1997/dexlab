import type { Pokemon, PokemonListItem, PokemonSpecies } from './types'

/**
 * Raw PokeAPI fetchers. Caching, deduping, retries and background
 * refetching are owned by TanStack Query (see src/lib/queryClient.ts
 * and src/hooks/usePokemon.ts) — these functions stay pure.
 */
const BASE = 'https://pokeapi.co/api/v2'

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`PokeAPI ${res.status} for ${url}`)
  return (await res.json()) as T
}

export function listUrl(limit: number, offset: number) {
  return `${BASE}/pokemon?limit=${limit}&offset=${offset}`
}

export interface PokemonListPage {
  count: number
  nextOffset: number | undefined
  results: Pokemon[]
}

export async function fetchPokemonPage(limit: number, offset: number) {
  return get<{ count: number; results: PokemonListItem[] }>(listUrl(limit, offset))
}

export async function fetchPokemon(nameOrId: string | number): Promise<Pokemon> {
  return get<Pokemon>(`${BASE}/pokemon/${String(nameOrId).toLowerCase().trim()}`)
}

/** Full detail objects for one list page, with bounded concurrency */
export async function fetchPokemonBatch(
  items: PokemonListItem[],
  concurrency = 8,
): Promise<Pokemon[]> {
  const out: (Pokemon | undefined)[] = new Array(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++
      try {
        out[i] = await fetchPokemon(items[i].name)
      } catch {
        out[i] = undefined
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return out.filter((p): p is Pokemon => p !== undefined)
}

/** One infinite-query page: list slice + hydrated details */
export async function fetchPokemonListPage(limit: number, offset: number): Promise<PokemonListPage> {
  const page = await fetchPokemonPage(limit, offset)
  const results = await fetchPokemonBatch(page.results)
  return {
    count: page.count,
    nextOffset: offset + limit < page.count ? offset + limit : undefined,
    results,
  }
}

export async function fetchSpecies(url: string): Promise<PokemonSpecies> {
  return get<PokemonSpecies>(url)
}

export function flavorText(species: PokemonSpecies | undefined): string {
  if (!species) return ''
  const entry = species.flavor_text_entries.find((e) => e.language.name === 'en')
  return entry ? entry.flavor_text.replace(/[\n\f\r]/g, ' ') : ''
}
