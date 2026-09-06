import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { orderBy } from "lodash-es"
import { Dna } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { artwork, dexId, title, TYPE_AURA, type Pokemon } from "@/lib/types"
import { prefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { TypeBadge } from "./TypeBadge"

interface Props {
  items: Pokemon[]
  onSelect: (p: Pokemon) => void
}

const bst = (p: Pokemon) => p.stats.reduce((a, s) => a + s.base_stat, 0)
const statOf = (p: Pokemon, name: string) =>
  p.stats.find((s) => s.stat.name === name)?.base_stat ?? 0

function MiniBars({ p }: { p: Pokemon }) {
  const rows: [string, number][] = [
    ["HP", statOf(p, "hp")],
    ["ATK", statOf(p, "attack")],
    ["SPD", statOf(p, "speed")],
  ]
  return (
    <div className="grid grid-cols-3 gap-2 font-mono text-center text-[11px]">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-line bg-chip p-2.5">
          <div className="text-ink/70">
            {label} {value}
          </div>
          <div className="mx-auto mt-2 h-1 w-full overflow-hidden rounded-full bg-chip">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF3355] to-[#FFD02F]"
              style={{ width: `${Math.min(100, (value / 180) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Static card shown before the collection loads */
function StaticSpecimen() {
  return (
    <div className="relative mx-auto w-full max-w-[360px] rounded-[2rem] border border-line bg-console/80 p-5 backdrop-blur">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40">
        <span className="flex items-center gap-1.5">
          <Dna className="size-3.5" /> specimen_001
        </span>
        <span>bulbasaur · grass/poison</span>
      </div>
      <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png"
        alt="Bulbasaur official artwork"
        className="mx-auto my-2 size-56 object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,.6)]"
      />
      <div className="grid grid-cols-3 gap-2 font-mono text-center text-[11px]">
        {[
          ["HP 45", 25],
          ["ATK 49", 27],
          ["SPD 45", 25],
        ].map(([label, pct]) => (
          <div key={label} className="rounded-xl border border-line bg-chip p-2.5">
            <div className="text-ink/70">{label}</div>
            <div className="mx-auto mt-2 h-1 w-full overflow-hidden rounded-full bg-chip">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF3355] to-[#FFD02F]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-ink/35">
        ht 0.7m · wt 6.9kg · xp 64
      </p>
    </div>
  )
}

/** Hero image carousel: the strongest catalogued specimens, auto-advancing */
export function HeroSpotlight({ items, onSelect }: Props) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  const spotlight = orderBy(items, [(p) => bst(p)], ["desc"]).slice(0, 8)

  // Stable autoplay plugin identity without memo: created once per mount.
  // A fresh array every render would make embla re-init the carousel loop.
  const pluginsRef = React.useRef<ReturnType<typeof Autoplay>[] | null>(null)
  if (pluginsRef.current === null) {
    pluginsRef.current = prefersReducedMotion()
      ? []
      : [Autoplay({ delay: 3500, stopOnInteraction: true })]
  }
  const plugins = pluginsRef.current

  React.useEffect(() => {
    if (!api) return
    const sync = () => setCurrent(api.selectedScrollSnap())
    sync()
    api.on("select", sync)
    api.on("reInit", sync)
    return () => {
      api.off("select", sync)
    }
  }, [api, spotlight.length])

  if (spotlight.length === 0) return <StaticSpecimen />

  return (
    <div className="relative mx-auto w-full max-w-[360px] rounded-[2rem] border border-line bg-console/80 p-5 backdrop-blur [perspective:1200px]">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40">
        <span className="flex items-center gap-1.5">
          <Dna className="size-3.5" /> spotlight
        </span>
        <span>
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(spotlight.length).padStart(2, "0")}
        </span>
      </div>

      <Carousel setApi={setApi} opts={{ align: "center", loop: true }} plugins={plugins}>
        <CarouselContent>
          {spotlight.map((p, i) => {
            const primary = p.types[0]?.type.name ?? "normal"
            const aura = TYPE_AURA[primary] ?? TYPE_AURA.normal
            return (
              <CarouselItem key={p.id}>
                <button
                  onClick={() => onSelect(p)}
                  aria-label={`Open dossier for ${p.name}`}
                  className="block w-full cursor-pointer rounded-2xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD02F]"
                >
                  <div className="relative">
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-x-8 top-0 bottom-0 bg-gradient-to-b blur-xl",
                        aura,
                      )}
                    />
                    <img
                      src={artwork(p)}
                      alt={`${p.name} official artwork`}
                      loading="lazy"
                      draggable={false}
                      className="relative mx-auto my-1 size-52 object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,.55)]"
                    />
                    <span className="absolute left-1 top-1 rounded-full border border-line bg-chip px-2 py-0.5 font-mono text-[10px] font-bold text-gold backdrop-blur">
                      #{i + 1}
                    </span>
                    <span className="absolute right-1 top-1 rounded-full border border-line bg-chip px-2 py-0.5 font-mono text-[10px] tracking-[0.2em] text-ink/50 backdrop-blur">
                      {dexId(p.id)}
                    </span>
                  </div>
                  <div className="font-display text-xl font-bold tracking-tight">
                    {title(p.name)}
                  </div>
                  <div className="mt-1.5 flex justify-center gap-1.5">
                    {p.types.map((t) => (
                      <TypeBadge key={t.type.name} type={t.type.name} />
                    ))}
                  </div>
                  <div className="mt-3">
                    <MiniBars p={p} />
                  </div>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/35">
                    ht {(p.height / 10).toFixed(1)}m · wt {(p.weight / 10).toFixed(1)}kg ·
                    bst {bst(p)}
                  </p>
                </button>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {spotlight.map((p, i) => (
          <button
            key={p.id}
            aria-label={`Go to slide ${i + 1}: ${p.name}`}
            onClick={() => api?.scrollTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all cursor-pointer",
              i === current
                ? "w-6 bg-[#FF3355]"
                : "w-1.5 bg-ink/20 hover:bg-ink/40",
            )}
          />
        ))}
      </div>
    </div>
  )
}
