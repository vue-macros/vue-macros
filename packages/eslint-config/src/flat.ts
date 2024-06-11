/* eslint perfectionist/sort-objects: "error" */

import { globals, rules } from './common'
import type { Linter } from 'eslint'

const config: Linter.FlatConfig = {
  languageOptions: {
    globals,
  },
  rules,
}

export default config
