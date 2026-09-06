import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/query-persist-client-core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const DAY = 24 * 60 * 60 * 1000

/**
 * Shared QueryClient. Pokédex data is effectively static, so entries
 * stay fresh for 10 min and are garbage-collected after 24 h.
 * No refetch on window focus — a research terminal shouldn't flicker.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: DAY,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * Persist the TanStack cache to localStorage so revisits paint instantly
 * from cache and refresh in the background once stale.
 *
 * Full Pokémon detail objects are heavy (a single one can be ~500 KB with
 * its full learnset), so the storage wrapper silently skips writes when the
 * ~5 MB quota is full instead of throwing — persistence is best-effort,
 * the network remains the source of truth.
 */
if (typeof window !== 'undefined') {
  const safeStorage = {
    getItem: (key: string) => {
      try {
        return window.localStorage.getItem(key)
      } catch {
        return null
      }
    },
    setItem: (key: string, value: string) => {
      try {
        window.localStorage.setItem(key, value)
      } catch {
        /* quota full or storage blocked — stay on network fetching */
      }
    },
    removeItem: (key: string) => {
      try {
        window.localStorage.removeItem(key)
      } catch {
        /* noop */
      }
    },
  }

  try {
    const persister = createSyncStoragePersister({
      storage: safeStorage,
      key: 'dexlab:query-cache',
      throttleTime: 2000,
    })
    void persistQueryClient({
      queryClient,
      persister,
      maxAge: DAY,
      buster: 'dexlab-v1',
    })
  } catch {
    /* persistence unavailable — memory cache still works */
  }
}
