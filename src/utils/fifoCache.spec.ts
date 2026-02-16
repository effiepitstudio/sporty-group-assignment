import { describe, it, expect } from 'vitest'
import { FIFOCache } from './fifoCache'

describe('FIFOCache', () => {
  describe('constructor', () => {
    it('creates a cache with the given capacity', () => {
      const cache = new FIFOCache<string, number>(10)
      expect(cache.size).toBe(0)
    })

    it('throws when capacity is less than 1', () => {
      expect(() => new FIFOCache(0)).toThrow('capacity must be at least 1')
      expect(() => new FIFOCache(-5)).toThrow('capacity must be at least 1')
    })
  })

  describe('put', () => {
    it('stores a key-value pair', () => {
      const cache = new FIFOCache<string, string>(3)
      cache.put('a', 'alpha')
      expect(cache.size).toBe(1)
      expect(cache.get('a')).toBe('alpha')
    })

    it('overwrites an existing key without increasing size', () => {
      const cache = new FIFOCache<string, string>(3)
      cache.put('a', 'alpha')
      cache.put('a', 'updated')
      expect(cache.size).toBe(1)
      expect(cache.get('a')).toBe('updated')
    })

    it('returns null when no eviction occurred', () => {
      const cache = new FIFOCache<string, number>(3)
      const evicted = cache.put('a', 1)
      expect(evicted).toBeNull()
    })

    it('returns the evicted key when capacity is exceeded', () => {
      const cache = new FIFOCache<string, number>(2)
      cache.put('a', 1)
      cache.put('b', 2)
      const evicted = cache.put('c', 3)
      expect(evicted).toBe('a')
    })
  })

  describe('get', () => {
    it('returns the value for an existing key', () => {
      const cache = new FIFOCache<string, number>(3)
      cache.put('x', 42)
      expect(cache.get('x')).toBe(42)
    })

    it('returns undefined for a non-existent key', () => {
      const cache = new FIFOCache<string, number>(3)
      expect(cache.get('missing')).toBeUndefined()
    })

    it('does not change eviction order on access', () => {
      const cache = new FIFOCache<string, number>(3)
      cache.put('a', 1)
      cache.put('b', 2)
      cache.put('c', 3)

      // Access 'a' — should NOT promote it in FIFO
      cache.get('a')

      // 'a' is still the oldest — should be evicted
      cache.put('d', 4)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
    })
  })

  describe('eviction order', () => {
    it('evicts the oldest entry (FIFO)', () => {
      const cache = new FIFOCache<string, number>(3)
      cache.put('a', 1)
      cache.put('b', 2)
      cache.put('c', 3)

      cache.put('d', 4)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
    })

    it('handles sequential evictions correctly', () => {
      const cache = new FIFOCache<string, number>(2)
      cache.put('a', 1)
      cache.put('b', 2)
      cache.put('c', 3)
      cache.put('d', 4)

      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })
  })

  describe('delete', () => {
    it('removes an existing key and returns true', () => {
      const cache = new FIFOCache<string, number>(3)
      cache.put('a', 1)
      expect(cache.delete('a')).toBe(true)
      expect(cache.size).toBe(0)
      expect(cache.get('a')).toBeUndefined()
    })

    it('returns false for a non-existent key', () => {
      const cache = new FIFOCache<string, number>(3)
      expect(cache.delete('nope')).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const cache = new FIFOCache<string, number>(5)
      cache.put('a', 1)
      cache.put('b', 2)
      cache.put('c', 3)
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.get('a')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('returns true for existing keys', () => {
      const cache = new FIFOCache<string, number>(3)
      cache.put('x', 1)
      expect(cache.has('x')).toBe(true)
    })

    it('returns false for evicted keys', () => {
      const cache = new FIFOCache<string, number>(1)
      cache.put('a', 1)
      cache.put('b', 2)
      expect(cache.has('a')).toBe(false)
    })
  })

  describe('keys', () => {
    it('returns keys in newest-to-oldest order', () => {
      const cache = new FIFOCache<string, number>(3)
      cache.put('a', 1)
      cache.put('b', 2)
      cache.put('c', 3)
      expect(cache.keys()).toEqual(['c', 'b', 'a'])
    })
  })

  describe('entries', () => {
    it('returns key-value pairs in newest-to-oldest order', () => {
      const cache = new FIFOCache<string, number>(3)
      cache.put('x', 10)
      cache.put('y', 20)
      const result = cache.entries()
      expect(result).toEqual([['y', 20], ['x', 10]])
    })
  })

  describe('capacity of 1', () => {
    it('holds exactly one entry', () => {
      const cache = new FIFOCache<string, string>(1)
      cache.put('only', 'one')
      expect(cache.get('only')).toBe('one')

      cache.put('new', 'entry')
      expect(cache.has('only')).toBe(false)
      expect(cache.get('new')).toBe('entry')
    })
  })
})
