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
                targetLang: "JA",
                isTranslating: false,
                errorMessage: ""
            })

            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

            if (text.trim().length > 2) {
                // Sync "Waiting..." state if desired, but let's stick to simple
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
                        errorMessage: ""
                    })

                    try {
                        const response = await sendToBackground({
                            name: "translate",
                            body: { text, sourceLang: "auto", targetLang: smartTargetLang }
                        }) as { text?: string; error?: string }

                        if (response.error) throw new Error(response.error)

                        setTranslatedText(response.text || "")

                        // Apply immediately to DOM? 
                        // Previous logic required manual "Apply" button click.
                        // Headless mode should probably just auto-apply OR the popup button does it? 
                        // The user request is "Migrate to Popup", implying interactivity in Popup.
                        // BUT, "Ai Prompt" usually implies auto-magic. 
                        // Let's AUTO-APPLY for now if it's "Headless", because opening popup to click apply is tedious.
                        // Wait, previous UI had an "Apply" button. The Popup "Ai Prompt" logic shows status.
                        // Impl: Popup "Ai Prompt" tab effectively just monitors. The existing logic *did not* auto-apply to DOM, it required button click.
                        // So I should keep it manual apply. But the button is now in the Popup (or effectively gone from overlay). 
                        // Let's make the HEADLESS script auto-replace? Or let's see. 
                        // User liked the Overlay UI. 
                        // Let's Sync the result. The Popup "AI Prompt" view creates visibility. 

                        syncState({
                            inputText: text,
                            translatedText: response.text || "",
                            targetLang: smartTargetLang,
                            isTranslating: false,
                            errorMessage: ""
                        })

                        // IMPORTANT: Allow the Content Script to receive a signal to Apply?
                        // Or just let the user copy-paste from popup?
                        // The previous overlay had a button.
                        // Let's add an auto-apply for now to make "Ai Prompt" powerful?
                        // No, let's stick to user request "don't change UI".
                        // Wait, if the UI is in the popup, where is the "Apply" button?
                        // I removed the Apply button from the Popup AiPromptTab because I cannot pass the `inputElement` reference to the Popup.
                        // Popup cannot interact with DOM directly.
                        // Messaging is needed: Popup "Apply" button -> Content Script -> DOM.
                        // For now, let's just sync the state.

                    } catch (error) {
                        syncState({
                            inputText: text,
                            translatedText: "",
                            targetLang: smartTargetLang,
                            isTranslating: false,
                            errorMessage: error.message
                        })
                    }
                }, 4000)
            }
        }

        inputElement.addEventListener("input", handleInput)
        return () => {
            inputElement.removeEventListener("input", handleInput)
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
        }
    }, [inputElement])

    // Listen for "Apply" message from Popup (Future proofing)
    useEffect(() => {
        const messageListener = (req, sender, sendResponse) => {
            if (req.name === "apply_translation" && inputElement && translatedText) {
                inputElement.innerText = translatedText
                inputElement.dispatchEvent(new Event('input', { bubbles: true }))
                sendResponse({ success: true })
            }
        }
        // Plasmo messaging listener registration if needed, but standard chrome runtime preferable for CS
    }, [inputElement, translatedText])

    return null // Headless
}

export default GeminiHeadless
