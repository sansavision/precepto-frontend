import { LANGUAGES } from './src/i18n/config'
import 'dotenv/config'

export default {
  baseLocale: 'en',
  locales: LANGUAGES,
  localePath: 'src/i18n/locales',
  openAIApiKey: process.env.OPENAI_API_KEY,
  openAIApiModel: process.env.OPENAI_API_MODEL, 
//   openAIApiUrl: process.env.OPENAI_API_URL,
}