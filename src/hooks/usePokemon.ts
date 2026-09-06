import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query'
import { fetchPokemon, fetchPokemonListPage, fetchSpecies, type PokemonListPage } from '@/lib/pokeapi'

export const PAGE_SIZE = 24
export const TOTAL = 1025

export const pokemonKeys = {
  all: ['pokemon'] as const,
  list: (pageSize: number) => [...pokemonKeys.all, 'list', pageSize] as const,
  detail: (nameOrId: string | number) => [...pokemonKeys.all, 'detail', String(nameOrId).toLowerCase()] as const,
  species: (url: string) => [...pokemonKeys.all, 'species', url] as const,
}

/** Paginated Pokédex collection with hydrated detail objects per page */
export function usePokemonList(pageSize = PAGE_SIZE) {
  return useInfiniteQuery<
    PokemonListPage,
    Error,
    InfiniteData<PokemonListPage>,
    ReturnType<typeof pokemonKeys.list>,
    number
  >({
    queryKey: pokemonKeys.list(pageSize),
    queryFn: ({ pageParam }) => fetchPokemonListPage(pageSize, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  })
}

/** Direct lookup by name or dex number; idle until a term is submitted */
export function usePokemonSearch(submitted: string) {
  const term = submitted.trim().toLowerCase()
  return useQuery({
    queryKey: pokemonKeys.detail(term),
    queryFn: () => fetchPokemon(term),
    enabled: term.length > 0,
  })
}

/** Species dossier (flavor text, genera, legendary flags) for the detail dialog */
export function usePokemonSpecies(url: string | undefined) {
  return useQuery({
    queryKey: pokemonKeys.species(url ?? ''),
    queryFn: () => fetchSpecies(url!),
    enabled: !!url,
  })
}

/** Imperative random-specimen lookup backed by the query cache */
export function useSurprisePokemon() {
  const client = useQueryClient()
  return async (onFound?: (p: { id: number; name: string }) => void) => {
    const id = Math.floor(Math.random() * TOTAL) + 1
    const p = await client.fetchQuery({
      queryKey: pokemonKeys.detail(id),
      queryFn: () => fetchPokemon(id),
    })
    onFound?.(p)
    return p
  }
}
