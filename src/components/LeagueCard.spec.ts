import { describe, it, expect, beforeEach } from 'vitest'
import { shallowMount, VueWrapper } from '@vue/test-utils'
import LeagueCard from './LeagueCard.vue'
import { mockLeagues } from '@/mocks/leagueData'

const defaultLeague = mockLeagues[0]

describe('LeagueCard', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = shallowMount(LeagueCard, {
      props: {
        league: defaultLeague,
        isSelected: false,
      },
    })
  })

  it('renders correctly when not selected', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders correctly when selected', () => {
    wrapper = shallowMount(LeagueCard, {
      props: {
        league: defaultLeague,
        isSelected: true,
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders without alternate name', () => {
    const leagueWithoutAlt = { ...defaultLeague, strLeagueAlternate: null }
    wrapper = shallowMount(LeagueCard, {
      props: {
        league: leagueWithoutAlt,
        isSelected: false,
      },
    })
    expect(wrapper.find('p').exists()).toBe(false)
  })

  describe('interactions', () => {
    it('emits select event with league id on click', async () => {
      await wrapper.find('article').trigger('click')
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual(['4328'])
    })

    it('emits select on enter keydown', async () => {
      await wrapper.find('article').trigger('keydown.enter')
      expect(wrapper.emitted('select')).toBeTruthy()
    })

    it('emits select on space keydown', async () => {
      await wrapper.find('article').trigger('keydown.space')
      expect(wrapper.emitted('select')).toBeTruthy()
    })
  })
})
