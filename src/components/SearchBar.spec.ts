import { describe, it, expect, beforeEach } from 'vitest'
import { shallowMount, VueWrapper } from '@vue/test-utils'
import SearchBar from './SearchBar.vue'

describe('SearchBar', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = shallowMount(SearchBar, {
      props: { modelValue: '' },
    })
  })

  it('renders correctly', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('reflects the model value in the input', () => {
    wrapper = shallowMount(SearchBar, {
      props: { modelValue: 'premier' },
    })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('premier')
  })

  it('emits update:modelValue on input', async () => {
    await wrapper.find('input').setValue('nba')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['nba'])
  })
})
