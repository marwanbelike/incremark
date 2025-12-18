import { ref, computed } from 'vue'
import { messages, sampleMarkdowns, type Locale, type Messages } from '../locales'

const locale = ref<Locale>((localStorage.getItem('locale') as Locale) || 'zh')

export function useLocale() {
  const t = computed<Messages>(() => messages[locale.value])
  const sampleMarkdown = computed(() => sampleMarkdowns[locale.value])

  function toggleLocale() {
    locale.value = locale.value === 'zh' ? 'en' : 'zh'
    localStorage.setItem('locale', locale.value)
  }

  function setLocale(newLocale: Locale) {
    locale.value = newLocale
    localStorage.setItem('locale', newLocale)
  }

  return {
    locale,
    t,
    sampleMarkdown,
    toggleLocale,
    setLocale
  }
}

