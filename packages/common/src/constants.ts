import { githubLink } from '#macros' assert { type: 'macro' }

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
export const DEFINE_EMIT = 'defineEmit'

export const REPO_ISSUE_URL = `${githubLink}/issues`

export const REGEX_SRC_FILE = /\.[cm]?[jt]sx?$/

export const REGEX_SETUP_SFC = /\.setup\.[cm]?[jt]sx?$/
export const REGEX_SETUP_SFC_SUB = /\.setup\.[cm]?[jt]sx?((?!vue&).)*$/

export const REGEX_VUE_SFC = /\.vue$/

/** webpack only */
export const REGEX_VUE_SUB = /\.vue\?vue&type=script/
/** webpack only */
export const REGEX_VUE_SUB_SETUP = /\.vue\?vue&type=script&setup=true/

export const REGEX_NODE_MODULES = /node_modules/
export const REGEX_SUPPORTED_EXT = /\.([cm]?[jt]sx?|vue)$/

export const VIRTUAL_ID_PREFIX = '/vue-macros'
