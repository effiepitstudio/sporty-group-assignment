import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from './debounce'

describe('Debounce Utility', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('debounce', () => {
    it('delays execution by the specified time', () => {
      const callback = vi.fn()
      const debouncedFn = debounce(callback, 300)

      debouncedFn()
      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)
      expect(callback).toHaveBeenCalledOnce()
    })

    it('resets the timer on subsequent calls', () => {
      const callback = vi.fn()
      const debouncedFn = debounce(callback, 300)

      debouncedFn()
      vi.advanceTimersByTime(200)
      debouncedFn()
      vi.advanceTimersByTime(200)

      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledOnce()
    })

    it('passes arguments to the callback', () => {
      const callback = vi.fn()
      const debouncedFn = debounce(callback, 100)

      debouncedFn('hello', 42)
      vi.advanceTimersByTime(100)

      expect(callback).toHaveBeenCalledWith('hello', 42)
    })

    it('only invokes once for rapid consecutive calls', () => {
      const callback = vi.fn()
      const debouncedFn = debounce(callback, 200)

      debouncedFn('a')
      debouncedFn('b')
      debouncedFn('c')
      debouncedFn('d')

      vi.advanceTimersByTime(200)
      expect(callback).toHaveBeenCalledOnce()
      expect(callback).toHaveBeenCalledWith('d')
    })

    it('allows multiple independent invocations with enough delay', () => {
      const callback = vi.fn()
      const debouncedFn = debounce(callback, 100)

      debouncedFn('first')
      vi.advanceTimersByTime(100)

      debouncedFn('second')
      vi.advanceTimersByTime(100)

      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback).toHaveBeenNthCalledWith(1, 'first')
      expect(callback).toHaveBeenNthCalledWith(2, 'second')
    })
  })
})
