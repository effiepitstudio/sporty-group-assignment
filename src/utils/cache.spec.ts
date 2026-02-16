import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setCache, getCache, removeCache, clearExpiredCache } from './cache'

function createMockStorage(): Storage {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
}

describe('Cache Utility', () => {
  let storage: Storage

  beforeEach(() => {
    storage = createMockStorage()
  })

  describe('setCache', () => {
    it('stores data with an expiry timestamp', () => {
      setCache('test-key', { name: 'test' }, storage, 5000)

      // isStorageAvailable also calls setItem, so the actual cache write is the last call
      const calls = (storage.setItem as ReturnType<typeof vi.fn>).mock.calls
      const storedRaw = calls[calls.length - 1][1]
      const stored = JSON.parse(storedRaw)
      expect(stored.data).toEqual({ name: 'test' })
      expect(stored.expiry).toBeGreaterThan(Date.now() - 1000)
    })

    it('stores string values', () => {
      setCache('string-key', 'hello', storage)
      expect(storage.setItem).toHaveBeenCalledWith('string-key', expect.any(String))
    })

    it('stores array values', () => {
      setCache('array-key', [1, 2, 3], storage)
      expect(storage.setItem).toHaveBeenCalledWith('array-key', expect.any(String))
    })
  })

  describe('getCache', () => {
    it('returns cached data when not expired', () => {
      const cacheItem = { data: { id: 1 }, expiry: Date.now() + 60000 }
      ;(storage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify(cacheItem)
      )

      const result = getCache<{ id: number }>('test-key', storage)
      expect(result).toEqual({ id: 1 })
    })

    it('returns null for expired cache entries', () => {
      const cacheItem = { data: { id: 1 }, expiry: Date.now() - 1000 }
      ;(storage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify(cacheItem)
      )

      const result = getCache('test-key', storage)
      expect(result).toBeNull()
      expect(storage.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('returns null for non-existent keys', () => {
      ;(storage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null)
      const result = getCache('missing-key', storage)
      expect(result).toBeNull()
    })

    it('returns null and cleans up malformed data', () => {
      ;(storage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        'not-valid-json'
      )
      const result = getCache('broken-key', storage)
      expect(result).toBeNull()
      expect(storage.removeItem).toHaveBeenCalledWith('broken-key')
    })
  })

  describe('removeCache', () => {
    it('removes the specified key', () => {
      removeCache('test-key', storage)
      expect(storage.removeItem).toHaveBeenCalledWith('test-key')
    })
  })

  describe('clearExpiredCache', () => {
    it('removes only expired league-list entries', () => {
      const expiredItem = JSON.stringify({ data: 'old', expiry: Date.now() - 1000 })
      const validItem = JSON.stringify({ data: 'new', expiry: Date.now() + 60000 })

      // Pre-populate mock storage so length getter returns 3
      storage.setItem('league-list:expired', expiredItem)
      storage.setItem('league-list:valid', validItem)
      storage.setItem('other-app:key', 'unrelated')

      // Clear spy call counts from the setup above
      vi.mocked(storage.removeItem).mockClear()

      clearExpiredCache(storage)

      expect(storage.removeItem).toHaveBeenCalledWith('league-list:expired')
      expect(storage.removeItem).not.toHaveBeenCalledWith('league-list:valid')
      expect(storage.removeItem).not.toHaveBeenCalledWith('other-app:key')
    })
  })
})
