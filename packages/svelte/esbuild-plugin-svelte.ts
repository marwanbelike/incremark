/**
 * @file esbuild-plugin-svelte.ts
 * @description 使用 Svelte 官方编译器的 esbuild 插件
 */

// @ts-expect-error - esbuild 类型由 tsup 提供
import type { Plugin } from 'esbuild'
import { compile } from 'svelte/compiler'
import { readFileSync } from 'fs'
import { dirname } from 'path'

/**
 * Svelte esbuild 插件
 * 使用 Svelte 官方编译器处理 .svelte 文件
 * 
 * 这个插件会在 esbuild 处理 .svelte 文件时：
 * 1. 读取 .svelte 文件内容
 * 2. 使用 Svelte 官方编译器编译为 JavaScript
 * 3. 返回编译后的代码给 esbuild
 */
export function sveltePlugin(): Plugin {
  return {
    name: 'svelte',
    setup(build) {
      // 处理 .svelte 文件的加载和编译
      build.onLoad({ filter: /\.svelte$/ }, async (args) => {
        const source = readFileSync(args.path, 'utf-8')
        
        try {
          // 使用 Svelte 编译器编译组件
          const result = compile(source, {
            filename: args.path,
            generate: 'client', // Svelte 5 使用 'client' 而不是 'dom'
            css: 'external', // CSS 外部化，由使用者处理
            runes: true // 启用 Svelte 5 runes
          })

          // 返回编译后的代码
          return {
            contents: result.js.code,
            loader: 'js',
            resolveDir: dirname(args.path)
          }
        } catch (error: any) {
          // 处理编译错误
          const errorMessage = error?.message || String(error)
          const location = error?.start ? {
            file: args.path,
            line: error.start.line,
            column: error.start.column
          } : undefined

          return {
            errors: [{
              text: errorMessage,
              location
            }]
          }
        }
      })
    }
  }
}

