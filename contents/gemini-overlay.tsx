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
    const debounceTimerRef = useRef<any | null>(null)

    // Helper to sync state to storage for Popup consumption
    const syncState = async (state: any) => {
        await storage.set("aiPromptState", state)
    }

    // Smart detection helper
    const containsJapanese = (text: string) => {
        const japaneseRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/
        return japaneseRegex.test(text)
    }

    const DEBOUNCE_MS = 2000;

    useEffect(() => {
        const findInput = () => {
            // Priority 1: Check Active Element (User is focused on it)
            const active = document.activeElement as HTMLElement
            if (active && (
                active.getAttribute('contenteditable') === 'true' ||
                active.tagName === 'TEXTAREA' ||
                active.getAttribute('role') === 'textbox' ||
                active.getAttribute('aria-label')?.includes('prompt') ||
                active.getAttribute('aria-label')?.includes('プロンプト')
            )) {
                if (active !== inputElement) {
                    console.log("[Plasmo Headless] Active Element detected as input:", active)
                    setInputElement(active)
                }
                return
            }

            // Priority 2: Fallback to selectors
            const selectors = [
                "div[contenteditable='true']",
                "div[role='textbox']",
                "textarea",
                "[aria-label*='prompt']",
                "[aria-label*='プロンプト']"
            ]
            for (const selector of selectors) {
                const el = document.querySelector(selector) as HTMLElement
                if (el) {
                    if (el !== inputElement) {
                        console.log(`[Plasmo Headless] Input detected via fallback selector: ${selector}`)
                        setInputElement(el)
                    }
                    return
                }
            }
        }

        findInput()

        // Listen for focus and click to catch user interaction immediately
        document.addEventListener('focus', findInput, true)
        document.addEventListener('click', findInput, true)

        const observer = new MutationObserver(() => findInput())
        observer.observe(document.body, { childList: true, subtree: true })

        return () => {
            document.removeEventListener('focus', findInput, true)
            document.removeEventListener('click', findInput, true)
            observer.disconnect()
        }
    }, [inputElement])

    useEffect(() => {
        if (!inputElement) {
            console.log("[Plasmo Headless] No input element active")
            return
        }
        console.log("[Plasmo Headless] Attached input listener to:", inputElement)

        const handleInput = (e: Event) => {
            const text = (e.target as HTMLElement).innerText
            console.log(`[Plasmo Headless] Input detected. Length: ${text.length}`)

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

            if (debounceTimerRef.current) {
                console.log("[Plasmo Headless] Clearing existing timer")
                clearTimeout(debounceTimerRef.current)
            }

            if (text.trim().length > 2) {
                // Set "Waiting" status
                console.log(`[Plasmo Headless] Setting timer for ${DEBOUNCE_MS}ms`)
                syncState({
                    inputText: text,
                    translatedText: "",
                    targetLang: "...",
                    isTranslating: false,
                    statusMessage: `Waiting ${DEBOUNCE_MS / 1000}s...`,
                    errorMessage: ""
                })

                debounceTimerRef.current = setTimeout(async () => {
                    console.log("[Plasmo Headless] Timer FIRED. Starting process...")
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
                        console.log(`[Plasmo Headless] Sending Request. Target: ${smartTargetLang}`)
                        const response = await sendToBackground({
                            name: "translate",
                            body: { text, sourceLang: "auto", targetLang: smartTargetLang }
                        }) as { text?: string; error?: string }

                        console.log("[Plasmo Headless] Response received:", response)

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
                        console.error("[Plasmo Headless] Error:", error)
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
            console.log("[Plasmo Headless] Detaching input listener (cleanup)")
            inputElement.removeEventListener("input", handleInput)
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
        }
    }, [inputElement])

    return null
}

export default GeminiHeadless
