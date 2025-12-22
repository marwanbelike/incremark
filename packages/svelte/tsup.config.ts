/**
 * @file tsup 构建配置
 * @description 配置 tsup 以支持 Svelte 文件编译
 */

import { defineConfig } from 'tsup'
import { sveltePlugin } from './esbuild-plugin-svelte'

export default defineConfig({
  entry: {
    index: 'src/index.ts'
  },
  format: ['esm'],
  dts: false, // Svelte SFC 不支持直接生成 dts，使用源码提供类型
  clean: true,
  external: ['svelte', '@incremark/core', '@incremark/devtools', '@incremark/theme', 'katex', 'mermaid', 'shiki'],
  sourcemap: true,
  esbuildPlugins: [sveltePlugin()]
})

