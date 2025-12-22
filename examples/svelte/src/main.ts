/**
 * @file main.ts - 应用入口文件
 * @description Svelte 应用的入口点
 */

import { mount } from 'svelte'
import App from './App.svelte'
import '@incremark/theme/styles.css'
import 'katex/dist/katex.min.css'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app

