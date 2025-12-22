/**
 * @file useLocale - 国际化 Store
 * @description 管理应用的语言和国际化消息
 */

import { writable, derived, type Writable, type Readable } from 'svelte/store'
import { messages, sampleMarkdowns, type Locale, type Messages } from '../locales'

/**
 * 从 localStorage 获取初始语言，默认为中文
 */
function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'zh'
  const saved = localStorage.getItem('locale') as Locale | null
  return saved === 'zh' || saved === 'en' ? saved : 'zh'
}

/**
 * 语言 store
 */
const locale = writable<Locale>(getInitialLocale())

/**
 * useLocale Store
 * 
 * @returns 国际化相关的状态和方法
 */
export function useLocale() {
  /**
   * 当前消息（根据语言自动更新）
   */
  const t = derived(locale, ($locale) => messages[$locale])

  /**
   * 当前示例 Markdown（根据语言自动更新）
   */
  const sampleMarkdown = derived(locale, ($locale) => sampleMarkdowns[$locale])

  /**
   * 切换语言
   */
  function toggleLocale() {
    locale.update((current) => {
      const newLocale = current === 'zh' ? 'en' : 'zh'
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', newLocale)
      }
      return newLocale
    })
  }

  /**
   * 设置语言
   */
  function setLocale(newLocale: Locale) {
    locale.set(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
  }

  return {
    locale,
    t,
    sampleMarkdown,
    toggleLocale,
    setLocale
  }
}

