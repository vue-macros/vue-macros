/* eslint perfectionist/sort-objects: "error" */

import { globals, rules } from './common'
import type { Linter } from 'eslint'

const config: Linter.Config = {
  languageOptions: {
    globals,
  },
  name: 'vue-macros/rules',
  rules,
}

export default config
