import { defineConfig } from 'wxt';
import purgecss from 'vite-plugin-purgecss';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'ShareCane',
    description: 'カスタマイズ可能なフォーマットでページ情報を共有するブラウザ拡張機能',
    permissions: [
      'activeTab',
      'storage'
    ]
  },
  vite: () => ({
    plugins: [
      purgecss({
        content: [
          './entrypoints/**/*.html',
          './entrypoints/**/*.ts',
          './entrypoints/**/*.js',
          './components/**/*.ts',
          './components/**/*.js'
        ],
        // 使用されているBulmaクラスを保護
        safelist: [
          // 基本クラス
          'container', 'field', 'control', 'label', 'textarea', 'button', 'box', 'tag', 'title', 'content', 'help',
          // モディファイア
          'is-primary', 'is-success', 'is-danger', 'is-small', 'is-5', 'is-grouped', 'is-fullwidth',
          // ユーティリティ
          'has-text-centered', 'mt-2', 'p-4'
        ]
      }) as any
    ]
  })
});
