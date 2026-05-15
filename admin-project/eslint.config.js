import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,mjs,jsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  // Vue组件名规则配置
  {
    files: ['**/*.vue'],
    rules: {
      // 忽略组件名大小写要求
      'vue/multi-word-component-names': 'off',
      // 允许使用单个单词的组件名
      'vue/component-definition-name-casing': 'off',
      // 允许组件名使用任何大小写格式
      'vue/name-property-casing': 'off'
    }
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
])
