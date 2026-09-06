/* Types mirroring https://pokeapi.co/api/v2/pokemon/{id} (see response.json) */

export interface NamedRef {
  name: string
  url: string
}

export interface PokemonAbility {
  is_hidden: boolean
  slot: number
  ability: NamedRef
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: NamedRef
}

export interface PokemonType {
  slot: number
  type: NamedRef
}

export interface PokemonMove {
  move: NamedRef
  version_group_details: {
    level_learned_at: number
    move_learn_method: NamedRef
    version_group: NamedRef
  }[]
}

export interface PokemonSprites {
  front_default: string | null
  back_default: string | null
  front_shiny: string | null
  back_shiny: string | null
  other?: {
    'official-artwork'?: { front_default: string | null; front_shiny: string | null }
    home?: { front_default: string | null; front_shiny: string | null }
    showdown?: { front_default: string | null }
    dream_world?: { front_default: string | null }
  }
}

export interface Pokemon {
  id: number
  name: string
  base_experience: number | null
  height: number // decimetres
  weight: number // hectograms
  abilities: PokemonAbility[]
  moves: PokemonMove[]
  species: NamedRef
  sprites: PokemonSprites
  cries?: { latest: string | null; legacy: string | null }
  stats: PokemonStat[]
  types: PokemonType[]
}

export interface PokemonListItem {
  name: string
  url: string
}

export interface PokemonSpecies {
  flavor_text_entries: { flavor_text: string; language: NamedRef; version: NamedRef }[]
  genera: { genus: string; language: NamedRef }[]
  habitat: NamedRef | null
  is_legendary: boolean
  is_mythical: boolean
  capture_rate: number
}

/** Primary type → aura gradient used for the signature glowing cards */
export const TYPE_AURA: Record<string, string> = {
  grass: 'from-emerald-400/40 via-emerald-500/10 to-transparent',
  fire: 'from-orange-500/45 via-red-500/10 to-transparent',
  water: 'from-sky-400/45 via-blue-500/10 to-transparent',
  electric: 'from-yellow-300/50 via-amber-400/10 to-transparent',
  poison: 'from-fuchsia-500/40 via-purple-500/10 to-transparent',
  psychic: 'from-pink-400/45 via-rose-500/10 to-transparent',
  ice: 'from-cyan-200/50 via-cyan-400/10 to-transparent',
  dragon: 'from-violet-500/45 via-indigo-500/10 to-transparent',
  dark: 'from-slate-500/40 via-slate-700/20 to-transparent',
  fairy: 'from-pink-300/45 via-fuchsia-300/10 to-transparent',
  normal: 'from-stone-300/30 via-stone-400/10 to-transparent',
  fighting: 'from-red-500/45 via-orange-600/10 to-transparent',
  flying: 'from-indigo-300/45 via-sky-300/10 to-transparent',
  ground: 'from-amber-500/45 via-yellow-700/10 to-transparent',
  rock: 'from-stone-400/45 via-amber-700/10 to-transparent',
  bug: 'from-lime-400/45 via-green-500/10 to-transparent',
  ghost: 'from-purple-500/45 via-indigo-700/15 to-transparent',
  steel: 'from-slate-300/40 via-slate-500/10 to-transparent',
}

export const TYPE_DOT: Record<string, string> = {
  grass: 'bg-emerald-400',
  fire: 'bg-orange-500',
  water: 'bg-sky-400',
  electric: 'bg-yellow-300',
  poison: 'bg-fuchsia-500',
  psychic: 'bg-pink-400',
  ice: 'bg-cyan-200',
  dragon: 'bg-violet-500',
  dark: 'bg-slate-500',
  fairy: 'bg-pink-300',
  normal: 'bg-stone-300',
  fighting: 'bg-red-500',
  flying: 'bg-indigo-300',
  ground: 'bg-amber-500',
  rock: 'bg-stone-400',
  bug: 'bg-lime-400',
  ghost: 'bg-purple-500',
  steel: 'bg-slate-300',
}

export const ALL_TYPES = Object.keys(TYPE_AURA)

export function dexId(id: number): string {
  return `#${String(id).padStart(4, '0')}`
}

export function title(name: string): string {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function artwork(p: Pick<Pokemon, 'sprites' | 'id'>): string {
  return (
    p.sprites.other?.['official-artwork']?.front_default ??
    p.sprites.other?.home?.front_default ??
    p.sprites.front_default ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`
  )
}
