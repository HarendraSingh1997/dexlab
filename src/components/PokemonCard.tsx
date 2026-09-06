import { Heart, Volume2 } from 'lucide-react'
import { artwork, dexId, title, TYPE_AURA, type Pokemon } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useTilt } from '@/hooks/useTilt'
import { TypeBadge } from './TypeBadge'

interface Props {
  pokemon: Pokemon
  isFav: boolean
  onToggleFav: (id: number) => void
  onSelect: (p: Pokemon) => void
  index: number
}

export function PokemonCard({ pokemon, isFav, onToggleFav, onSelect, index }: Props) {
  const primary = pokemon.types[0]?.type.name ?? 'normal'
  const aura = TYPE_AURA[primary] ?? TYPE_AURA.normal
  const bst = pokemon.stats.reduce((a, s) => a + s.base_stat, 0)
  const tilt = useTilt(9)

  return (
    <article
      ref={tilt.ref}
      onClick={() => onSelect(pokemon)}
      {...tilt.handlers}
      style={{ animationDelay: `${Math.min(index % 24, 12) * 40}ms` }}
      className="group rise-in relative cursor-pointer overflow-hidden rounded-3xl border border-line bg-console/90 [transform-style:preserve-3d] transition-[box-shadow,border-color] duration-300 hover:shadow-[0_24px_70px_-20px_rgba(255,51,85,.35)]"
    >
      {/* signature type-reactive aura */}
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b', aura)} />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.14), 0 24px 70px -20px rgba(255,51,85,.35)' }}
      />

      <div className="relative flex items-start justify-between p-4 pb-0 [transform:translateZ(30px)]">
        <span className="font-mono text-xs font-semibold tracking-[0.2em] text-ink/40">
          {dexId(pokemon.id)}
        </span>
        <div className="flex gap-1.5">
          <button
            aria-label="Play cry"
            onClick={(e) => {
              e.stopPropagation()
              const url = pokemon.cries?.latest
              if (url) new Audio(url).play().catch(() => {})
            }}
            className="rounded-full border border-white/10 bg-black/30 p-1.5 text-white/70 backdrop-blur transition hover:bg-white/25 hover:text-white cursor-pointer"
          >
            <Volume2 className="size-3.5" />
          </button>
          <button
            aria-label="Toggle favorite"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFav(pokemon.id)
            }}
            className={cn(
              'rounded-full border p-1.5 backdrop-blur transition cursor-pointer',
              isFav
                ? 'border-[#FF3355]/50 bg-[#FF3355]/20 text-rose'
                : 'border-white/10 bg-black/30 text-white/70 hover:bg-white/25 hover:text-white',
            )}
          >
            <Heart className={cn('size-3.5', isFav && 'fill-current')} />
          </button>
        </div>
      </div>

      <div className="relative flex justify-center px-6 pt-1">
        <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 font-display text-[64px] font-bold tracking-tighter text-ink/[.07] select-none">
          {String(pokemon.id).padStart(3, '0')}
        </span>
        <img
          src={artwork(pokemon)}
          alt={pokemon.name}
          loading="lazy"
          className="sprite-float relative size-36 object-contain [transform:translateZ(50px)]"
          onError={(e) => {
            const t = e.currentTarget
            if (!t.src.includes('front_default')) {
              t.src = pokemon.sprites.front_default ?? t.src
            }
          }}
        />
      </div>

      <div className="relative p-4 pt-2 [transform:translateZ(20px)]">
        <h3 className="font-display text-lg font-bold tracking-tight">{title(pokemon.name)}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pokemon.types.map((t) => (
            <TypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 font-mono text-[11px] text-ink/45">
          <span>
            HT <span className="text-ink/80">{(pokemon.height / 10).toFixed(1)}m</span>
          </span>
          <span>
            WT <span className="text-ink/80">{(pokemon.weight / 10).toFixed(1)}kg</span>
          </span>
          <span>
            BST <span className="text-gold">{bst}</span>
          </span>
        </div>
      </div>
    </article>
  )
}
