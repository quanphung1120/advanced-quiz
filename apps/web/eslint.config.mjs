import { tanstackConfig } from '@tanstack/eslint-config'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  ...tanstackConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      // Custom overrides here
    },
  },
]
