import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef, useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
    matches: ["https://gemini.google.com/*"]
}

const storage = new Storage()

const GeminiHeadless = () => {
    const [inputText, setInputText] = useState("")
    const [translatedText, setTranslatedText] = useState("")
    const [targetLang, setTargetLang] = useState("JA")
    const [inputElement, setInputElement] = useState<HTMLElement | null>(null)
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Helper to sync state to storage for Popup consumption
    const syncState = async (state: any) => {
        await storage.set("aiPromptState", state)
    }

    // Smart detection helper
    const containsJapanese = (text: string) => {
        const japaneseRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/
        return japaneseRegex.test(text)
    }

    const DEBOUNCE_MS = 4000;

    useEffect(() => {
        const findInput = () => {
            const selectors = [
                "div[contenteditable='true']",
                "div[role='textbox']",
                "textarea",
                "[aria-label*='prompt']",
                "[aria-label*='プロンプト']"
            ]
            for (const selector of selectors) {
                const el = document.querySelector(selector) as HTMLElement
                if (el && el !== inputElement) {
                    console.log(`[Plasmo Headless] Input detected: ${selector}`)
                    setInputElement(el)
                    return
                }
            }
        }
        findInput()
        const observer = new MutationObserver(() => findInput())
        observer.observe(document.body, { childList: true, subtree: true })
        return () => observer.disconnect()
    }, [inputElement])

    useEffect(() => {
        if (!inputElement) return

        const handleInput = (e: Event) => {
            const text = (e.target as HTMLElement).innerText
            setInputText(text)
            setTranslatedText("")

            // Sync initial state
            syncState({
                inputText: text,
                translatedText: "",
                targetLang: "JA", // Placeholder
                isTranslating: false,
                statusMessage: "Typing...",
                errorMessage: ""
            })

            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

            if (text.trim().length > 2) {
                // Set "Waiting" status
                syncState({
                    inputText: text,
                    translatedText: "",
                    targetLang: "...",
                    isTranslating: false,
                    statusMessage: `Waiting ${DEBOUNCE_MS / 1000}s...`,
                    errorMessage: ""
                })

                debounceTimerRef.current = setTimeout(async () => {
                    const isJapanese = containsJapanese(text)
                    const smartTargetLang = isJapanese ? "EN" : "JA"
                    setTargetLang(smartTargetLang)

                    // Sync "translating" state
                    syncState({
                        inputText: text,
                        translatedText: "",
                        targetLang: smartTargetLang,
                        isTranslating: true,
                        statusMessage: "Translating...",
                        errorMessage: ""
                    })

                    try {
                        const response = await sendToBackground({
                            name: "translate",
                            body: { text, sourceLang: "auto", targetLang: smartTargetLang }
                        }) as { text?: string; error?: string }

                        if (response.error) throw new Error(response.error)

                        setTranslatedText(response.text || "")

                        syncState({
                            inputText: text,
                            translatedText: response.text || "",
                            targetLang: smartTargetLang,
                            isTranslating: false,
                            statusMessage: "Done",
                            errorMessage: ""
                        })

                    } catch (error) {
                        syncState({
                            inputText: text,
                            translatedText: "",
                            targetLang: smartTargetLang,
                            isTranslating: false,
                            statusMessage: "Error",
                            errorMessage: error.message
                        })
                    }
                }, DEBOUNCE_MS)
            }
        }

        inputElement.addEventListener("input", handleInput)
        return () => {
            inputElement.removeEventListener("input", handleInput)
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
        }
    }, [inputElement])

    return null
}

export default GeminiHeadless
