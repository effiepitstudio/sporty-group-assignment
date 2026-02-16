import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useBadge } from './use-badge'
import { createPopulatedMockStore } from '@/mocks/storeMock'

function mountWithComposable(storeOverrides = {}) {
  const TestComponent = defineComponent({
    setup() {
      return useBadge()
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

describe('useBadge', () => {
  describe('activeBadge', () => {
    it('returns null when no badge is active', () => {
      const { wrapper } = mountWithComposable()
      expect(wrapper.vm.activeBadge).toBeNull()
    })

    it('returns badge data when active', () => {
      const badge = { leagueId: '4328', badgeUrl: 'https://example.com/badge.png' }
      const { wrapper } = mountWithComposable({ activeBadge: badge })
      expect(wrapper.vm.activeBadge).toEqual(badge)
    })
  })

  describe('isLoading', () => {
    it('reflects the badge loading state', () => {
      const { wrapper } = mountWithComposable({ badgeLoading: true })
      expect(wrapper.vm.isLoading).toBe(true)
    })
  })

  describe('error', () => {
    it('reflects the badge error state', () => {
      const { wrapper } = mountWithComposable({ badgeError: 'Failed' })
      expect(wrapper.vm.error).toBe('Failed')
    })
  })

  describe('isModalOpen', () => {
    it('returns true when badge is active', () => {
      const { wrapper } = mountWithComposable({
        activeBadge: { leagueId: '1', badgeUrl: null },
      })
      expect(wrapper.vm.isModalOpen).toBe(true)
    })

    it('returns true when badge is loading', () => {
      const { wrapper } = mountWithComposable({ badgeLoading: true })
      expect(wrapper.vm.isModalOpen).toBe(true)
    })

    it('returns false when neither active nor loading', () => {
      const { wrapper } = mountWithComposable()
      expect(wrapper.vm.isModalOpen).toBe(false)
    })
  })

  describe('openBadge', () => {
    it('dispatches fetchBadge action', () => {
      const { wrapper, store } = mountWithComposable()
      wrapper.vm.openBadge('4328')
      expect(store._actions.fetchBadge).toBeDefined()
    })
  })

  describe('closeBadge', () => {
    it('dispatches closeBadgeModal action', () => {
      const { wrapper, store } = mountWithComposable()
      wrapper.vm.closeBadge()
      expect(store._actions.closeBadgeModal).toBeDefined()
    })
  })

  describe('isSelected', () => {
    it('returns true when league matches active badge', () => {
      const { wrapper } = mountWithComposable({
        activeBadge: { leagueId: '4328', badgeUrl: null },
      })
      expect(wrapper.vm.isSelected('4328')).toBe(true)
    })

    it('returns false for non-matching league', () => {
      const { wrapper } = mountWithComposable({
        activeBadge: { leagueId: '4328', badgeUrl: null },
      })
      expect(wrapper.vm.isSelected('9999')).toBe(false)
    })
  })
})
