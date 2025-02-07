import process from 'node:process'
import { testFixturesSkip } from '@vue-macros/test-utils'

const SKIP_VUE2 = !!process.env.SKIP_VUE2
testFixturesSkip((testName) => testName.includes('vue2') && SKIP_VUE2)
