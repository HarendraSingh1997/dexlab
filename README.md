# DEXLAB — Field Research Pokédex

A research-terminal Pokédex. Filter by type signature, audition cries, open a
dossier for stats, abilities and the full learnset — built on live
`pokeapi.co` data.

![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack-Query-FF4154?logo=reactquery&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn-ui-white?logo=shadcnui&logoColor=black)

## Features

- **Collection grid** — infinite-scrolling Pokédex with type filtering, sorting
  (dex №, A–Z, strongest by base-stat total), and favorites persisted to
  `localStorage`
- **Deep-linked search** — `?search=bul` runs on load and stays shareable;
  back/forward navigation restores it
- **Dossier dialog** — artwork, vitals, flavor text, stat bars, abilities and
  the full learnset, with prev/next paging (`←`/`→` keys included) and
  skeleton loading states for async parts
- **Hero spotlight carousel** — auto-advancing showcase of the strongest
  catalogued specimens (shadcn Carousel + Embla)
- **Light/dark themes** — theme-aware design tokens, OS preference respected,
  no first-paint flash
- **3D motion** — pointer-driven card tilt, levitating hero artwork and a
  spin-in dossier entrance via anime.js (all `prefers-reduced-motion` aware)
- **Cached data layer** — TanStack Query with `localStorage` persistence:
  revisits paint instantly and revalidate in the background

## Tech stack

| Layer      | Choice                                              |
| ---------- | --------------------------------------------------- |
| Framework  | React 19 + Vite 6 + TypeScript                      |
| Styling    | Tailwind CSS v4, theme-aware tokens                 |
| UI         | shadcn-style primitives (Radix, Embla, cva, lucide) |
| Data       | TanStack Query v5 + persisted query cache           |
| Motion     | anime.js v4                                         |
| API        | [PokeAPI](https://pokeapi.co) (`response.json` is the checked-in schema reference) |

## Getting started

```bash
npm install
npm run dev      # → http://localhost:5173
```

| Script          | Purpose                              |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server                 |
| `npm run build` | Type-check (`tsc -b`) + build `dist/` |
| `npm run preview` | Preview the production build       |

Requires Node 20+.

## Project structure

```
src/
├── App.tsx                 # shell: header, hero, filters, grid, footer
├── components/
│   ├── HeroSpotlight.tsx   # hero carousel (strongest specimens)
│   ├── PokemonCard.tsx     # 3D tilt card with type aura
│   ├── PokemonDetail.tsx   # dossier dialog with pager
│   └── ui/                 # shadcn primitives (button, card, dialog, …)
├── hooks/
│   ├── usePokemon.ts       # TanStack Query hooks (list, search, species)
│   ├── useTheme.ts         # light/dark theme
│   └── useTilt.ts          # pointer 3D tilt
└── lib/
    ├── pokeapi.ts          # raw PokeAPI fetchers
    ├── queryClient.ts      # QueryClient + persisted cache
    └── types.ts            # PokeAPI shapes (mirrors response.json)
```

## Notes

- Single package manager: **npm** (`package-lock.json` is the source of truth).
  Vite is configured with `resolve.dedupe: ['react', 'react-dom']` so the
  pre-bundler can never split React into two copies.
- No manual `useMemo`/`useCallback`/`memo` by convention — plain
  computations, with `useRef` where stable identity matters (e.g. the Embla
  autoplay plugin).
