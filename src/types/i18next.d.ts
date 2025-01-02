import type resources from './resources'
import type { defaultNS } from '../i18n/config'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: typeof resources
  }
}