import { describe, it, expect, beforeEach } from 'vitest'
import { shallowMount, VueWrapper } from '@vue/test-utils'
import LeagueList from './LeagueList.vue'
import { mockLeagues } from '@/mocks/leagueData'

describe('LeagueList', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = shallowMount(LeagueList, {
      props: {
        leagues: mockLeagues,
        isLoading: false,
        error: null,
      },
    })
  })

  it('renders loading state', () => {
    wrapper = shallowMount(LeagueList, {
      props: {
        leagues: mockLeagues,
        isLoading: true,
        error: null,
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders error state', () => {
    wrapper = shallowMount(LeagueList, {
      props: {
        leagues: [],
        isLoading: false,
        error: 'Network failed',
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders empty state', () => {
    wrapper = shallowMount(LeagueList, {
      props: {
        leagues: [],
        isLoading: false,
        error: null,
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders the correct number of league cards', () => {
    expect(wrapper.findAll('li')).toHaveLength(mockLeagues.length)
  })

  it('emits retry on button click in error state', async () => {
    wrapper = shallowMount(LeagueList, {
      props: {
        leagues: [],
        isLoading: false,
        error: 'Error',
      },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('emits selectLeague when a card emits select', async () => {
    const card = wrapper.findComponent({ name: 'LeagueCard' })
    card.vm.$emit('select', mockLeagues[0].idLeague)
    expect(wrapper.emitted('selectLeague')).toBeTruthy()
    expect(wrapper.emitted('selectLeague')![0]).toEqual([mockLeagues[0].idLeague])
  })
})
