import { describe, it, expect, beforeEach } from 'vitest'
import { SearchIndex } from './searchIndex'

describe('SearchIndex', () => {
  let index: SearchIndex<string>

  beforeEach(() => {
    index = new SearchIndex<string>()
  })

  describe('addEntity', () => {
    it('indexes an entity by its text fields', () => {
      index.addEntity('1', 'English Premier League')
      expect(index.indexSize).toBeGreaterThan(0)
    })

    it('skips null and undefined fields', () => {
      index.addEntity('1', 'Valid Name', null, undefined)
      const results = index.search('valid')
      expect(results.has('1')).toBe(true)
    })

    it('indexes multiple text fields for the same entity', () => {
      index.addEntity('1', 'La Liga', 'Primera Division')
      expect(index.search('liga').has('1')).toBe(true)
      expect(index.search('primera').has('1')).toBe(true)
    })
  })

  describe('search', () => {
    beforeEach(() => {
      index.addEntity('epl', 'English Premier League', 'Premier League, EPL')
      index.addEntity('nba', 'NBA', 'National Basketball Association')
      index.addEntity('f1', 'Formula 1', 'F1')
      index.addEntity('liga', 'La Liga', 'Primera Division')
      index.addEntity('nfl', 'NFL', 'National Football League')
    })

    it('finds entities by full token match', () => {
      const results = index.search('premier')
      expect(results.has('epl')).toBe(true)
      expect(results.size).toBe(1)
    })

    it('supports substring matching (not just prefix)', () => {
      const results = index.search('remier')
      expect(results.has('epl')).toBe(true)
    })

    it('is case-insensitive', () => {
      const results = index.search('NBA')
      expect(results.has('nba')).toBe(true)
    })

    it('matches across alternate names', () => {
      const results = index.search('primera')
      expect(results.has('liga')).toBe(true)
    })

    it('intersects multi-word queries — all tokens must match', () => {
      const results = index.search('national basketball')
      expect(results.has('nba')).toBe(true)
      expect(results.has('nfl')).toBe(false)
    })

    it('returns empty set for no matches', () => {
      const results = index.search('cricket')
      expect(results.size).toBe(0)
    })

    it('returns empty set for empty query', () => {
      const results = index.search('')
      expect(results.size).toBe(0)
    })

    it('returns empty set for whitespace-only query', () => {
      const results = index.search('   ')
      expect(results.size).toBe(0)
    })

    it('trims whitespace from query', () => {
      const results = index.search('  premier  ')
      expect(results.has('epl')).toBe(true)
    })

    it('handles single-character tokens by filtering them out', () => {
      const results = index.search('formula')
      expect(results.has('f1')).toBe(true)
    })
  })

  describe('removeEntity', () => {
    it('removes all index entries for the given entity', () => {
      index.addEntity('1', 'Test League')
      index.removeEntity('1')
      const results = index.search('test')
      expect(results.has('1')).toBe(false)
    })

    it('does not affect other entities', () => {
      index.addEntity('1', 'Alpha League')
      index.addEntity('2', 'Beta League')
      index.removeEntity('1')
      expect(index.search('league').has('2')).toBe(true)
    })

    it('cleans up empty suffix sets from the index', () => {
      index.addEntity('1', 'UniqueWord')
      const sizeBefore = index.indexSize
      index.removeEntity('1')
      expect(index.indexSize).toBeLessThan(sizeBefore)
    })
  })

  describe('clear', () => {
    it('empties the entire index', () => {
      index.addEntity('1', 'Hello World')
      index.addEntity('2', 'Goodbye World')
      index.clear()
      expect(index.indexSize).toBe(0)
      expect(index.search('world').size).toBe(0)
    })
  })

  describe('tokenization', () => {
    it('splits on spaces, commas, dots, hyphens, underscores, slashes', () => {
      index.addEntity('1', 'one-two/three_four.five,six')
      expect(index.search('two').has('1')).toBe(true)
      expect(index.search('five').has('1')).toBe(true)
    })

    it('filters out single-character tokens as noise', () => {
      index.addEntity('1', 'A Big League')
      expect(index.search('big').has('1')).toBe(true)
    })
  })

  describe('numeric keys', () => {
    it('works with numeric entity IDs', () => {
      const numIndex = new SearchIndex<number>()
      numIndex.addEntity(42, 'Test League')
      const results = numIndex.search('test')
      expect(results.has(42)).toBe(true)
    })
  })
})
