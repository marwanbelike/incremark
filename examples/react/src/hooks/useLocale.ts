import { useState, useMemo, useCallback } from 'react'
import { messages, sampleMarkdowns, type Locale, type Messages } from '../locales'

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return (localStorage.getItem('locale') as Locale) || 'zh'
  })

  const t = useMemo<Messages>(() => messages[locale], [locale])
  const sampleMarkdown = useMemo(() => sampleMarkdowns[locale], [locale])

  const toggleLocale = useCallback(() => {
    const newLocale = locale === 'zh' ? 'en' : 'zh'
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }, [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }, [])

  return {
    locale,
    t,
    sampleMarkdown,
    toggleLocale,
    setLocale
  }
}

