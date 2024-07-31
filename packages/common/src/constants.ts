import { githubLink } from '#macros' with { type: 'macro' }

export const DEFINE_PROPS = 'defineProps'
export const DEFINE_PROPS_DOLLAR = '$defineProps'
export const DEFINE_PROPS_REFS = 'definePropsRefs'
export const DEFINE_EMITS = 'defineEmits'
export const WITH_DEFAULTS = 'withDefaults'
export const DEFINE_OPTIONS = 'defineOptions'
export const DEFINE_MODELS = 'defineModels'
export const DEFINE_MODELS_DOLLAR = '$defineModels'
export const DEFINE_SETUP_COMPONENT = 'defineSetupComponent'
export const DEFINE_RENDER = 'defineRender'
export const DEFINE_SLOTS = 'defineSlots'
export const DEFINE_PROP = 'defineProp'
export const DEFINE_PROP_DOLLAR = '$defineProp'
export const DEFINE_EMIT = 'defineEmit'

export const REPO_ISSUE_URL: 'https://github.com/vue-macros/vue-macros/issues' = `${githubLink}/issues`

export const REGEX_SRC_FILE: RegExp = /\.[cm]?[jt]sx?$/

export const REGEX_SETUP_SFC: RegExp = /\.setup\.[cm]?[jt]sx?$/
export const REGEX_SETUP_SFC_SUB: RegExp =
  /\.setup\.[cm]?[jt]sx?((?!(?<!definePage&)vue&).)*$/

export const REGEX_VUE_SFC: RegExp = /\.vue$/

/** webpack only */
export const REGEX_VUE_SUB: RegExp = /\.vue\?vue&type=script/
/** webpack only */
export const REGEX_VUE_SUB_SETUP: RegExp =
  /\.vue\?vue&type=script\b.+\bsetup=true/

export const REGEX_NODE_MODULES: RegExp = /node_modules/
export const REGEX_SUPPORTED_EXT: RegExp = /\.([cm]?[jt]sx?|vue)$/

export const VIRTUAL_ID_PREFIX = '/vue-macros'
