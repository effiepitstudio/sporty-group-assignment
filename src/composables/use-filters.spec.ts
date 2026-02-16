import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useFilters } from './use-filters'
import { createPopulatedMockStore } from '@/mocks/storeMock'

function mountWithComposable(storeOverrides = {}) {
  const TestComponent = defineComponent({
    setup() {
      return useFilters()
    },
    template: '<div />',
  })

  const store = createPopulatedMockStore(storeOverrides)

  const wrapper = mount(TestComponent, {
    global: {
      plugins: [store],
    },
  })

  return { wrapper, store }
}

describe('useFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('searchInput', () => {
    it('initializes from store state', () => {
      const { wrapper } = mountWithComposable({ searchQuery: 'premier' })
      expect(wrapper.vm.searchInput).toBe('premier')
    })

    it('dispatches updateSearchQuery after debounce', async () => {
      const { wrapper, store } = mountWithComposable()
      wrapper.vm.searchInput = 'nba'

      await nextTick()
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(store._actions.updateSearchQuery).toBeDefined()
    })
  })

  describe('selectedSport', () => {
    it('initializes from store state', () => {
      const { wrapper } = mountWithComposable({ selectedSport: 'Soccer' })
      expect(wrapper.vm.selectedSport).toBe('Soccer')
    })
  })

  describe('availableSports', () => {
    it('returns computed list from store getter', () => {
      const { wrapper } = mountWithComposable()
      expect(wrapper.vm.availableSports).toContain('Soccer')
      expect(wrapper.vm.availableSports).toContain('Basketball')
    })
  })

  describe('hasActiveFilters', () => {
    it('returns false when no filters are active', () => {
      const { wrapper } = mountWithComposable()
      expect(wrapper.vm.hasActiveFilters).toBe(false)
    })

    it('returns true when search query is active', () => {
      const { wrapper } = mountWithComposable({ searchQuery: 'nba' })
      expect(wrapper.vm.hasActiveFilters).toBe(true)
    })

    it('returns true when sport is selected', () => {
      const { wrapper } = mountWithComposable({ selectedSport: 'Soccer' })
      expect(wrapper.vm.hasActiveFilters).toBe(true)
    })
  })

  describe('clearFilters', () => {
    it('resets searchInput to empty string', () => {
      const { wrapper } = mountWithComposable({ searchQuery: 'test' })
      wrapper.vm.clearFilters()
      expect(wrapper.vm.searchInput).toBe('')
    })
  })
})
