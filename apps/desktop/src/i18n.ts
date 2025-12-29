/**
 * i18n Configuration
 * Internationalization setup for PassKeyPer
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import de from './locales/de.json'

// Language resources
const resources = {
    en: { translation: en },
    de: { translation: de },
}

// Detect browser/system language
const detectLanguage = (): string => {
    const stored = localStorage.getItem('language')
    if (stored) return stored

    const browserLang = navigator.language.split('-')[0]
    return ['en', 'de'].includes(browserLang) ? browserLang : 'en'
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: detectLanguage(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    })

export default i18n

// Available languages
export const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
]

// Change language
export const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
}
