import { Storage } from "@plasmohq/storage"

export const storage = new Storage()

export const STORAGE_KEYS = {
    TARGET_LANG: "targetLang",
    AUTO_APPLY: "autoApply"
}

export const defaultSettings = {
    targetLang: "JA",
    autoApply: false
}

export const getTargetLang = async () => {
    return (await storage.get(STORAGE_KEYS.TARGET_LANG)) || defaultSettings.targetLang
}

export const setTargetLang = async (lang: string) => {
    await storage.set(STORAGE_KEYS.TARGET_LANG, lang)
}
