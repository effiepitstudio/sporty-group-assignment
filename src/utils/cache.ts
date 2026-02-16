import { CACHE_TTL_MS } from '@/common/constants'

interface CacheItem<T> {
  data: T
  expiry: number
}

function isStorageAvailable(storage: Storage): boolean {
  const testKey = '__storage_test__'
  try {
    storage.setItem(testKey, 'test')
    storage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

export function setCache<T>(
  key: string,
  data: T,
  storage: Storage = sessionStorage,
  ttl: number = CACHE_TTL_MS
): void {
  if (!isStorageAvailable(storage)) return

  const cacheItem: CacheItem<T> = {
    data,
    expiry: Date.now() + ttl,
  }

  try {
    storage.setItem(key, JSON.stringify(cacheItem))
  } catch {
    // Storage full — clear expired and retry once
    clearExpiredCache(storage)
    try {
      storage.setItem(key, JSON.stringify(cacheItem))
    } catch {}
  }
}

export function getCache<T>(
  key: string,
  storage: Storage = sessionStorage
): T | null {
  if (!isStorageAvailable(storage)) return null

  const raw = storage.getItem(key)
  if (!raw) return null

  try {
    const cacheItem: CacheItem<T> = JSON.parse(raw)
    if (Date.now() > cacheItem.expiry) {
      storage.removeItem(key)
      return null
    }
    return cacheItem.data
  } catch {
    storage.removeItem(key)
    return null
  }
}

export function removeCache(
  key: string,
  storage: Storage = sessionStorage
): void {
  if (!isStorageAvailable(storage)) return
  storage.removeItem(key)
}

export function clearExpiredCache(storage: Storage = sessionStorage): void {
  if (!isStorageAvailable(storage)) return

  const keysToRemove: string[] = []

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (!key?.startsWith('league-list:')) continue

    const raw = storage.getItem(key)
    if (!raw) continue

    try {
      const cacheItem = JSON.parse(raw)
      if (cacheItem.expiry && Date.now() > cacheItem.expiry) {
        keysToRemove.push(key)
      }
    } catch {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => storage.removeItem(key))
}
