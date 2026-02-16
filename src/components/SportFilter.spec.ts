import { describe, it, expect, beforeEach } from 'vitest'
import { shallowMount, VueWrapper } from '@vue/test-utils'
import SportFilter from './SportFilter.vue'

const mockSports = ['Basketball', 'Motorsport', 'Soccer']

describe('SportFilter', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = shallowMount(SportFilter, {
      props: {
        modelValue: '',
        sports: mockSports,
      },
    })
  })

  it('renders correctly', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('reflects the current model value', () => {
    wrapper = shallowMount(SportFilter, {
      props: {
        modelValue: 'Soccer',
        sports: mockSports,
      },
    })
    expect(
      (wrapper.find('select').element as HTMLSelectElement).value
    ).toBe('Soccer')
  })

  it('emits update:modelValue on change', async () => {
    await wrapper.find('select').setValue('Basketball')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['Basketball'])
  })
})
