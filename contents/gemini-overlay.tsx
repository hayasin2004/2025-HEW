import cssText from "data-text:~/style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef, useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"

import { getTargetLang } from "~lib/storage"

export const config: PlasmoCSConfig = {
    matches: ["https://gemini.google.com/*"]
}

export const getStyle = () => {
    const style = document.createElement("style")
    style.textContent = cssText
    return style
}

const GeminiOverlay = () => {
    const [inputText, setInputText] = useState("")
    const [translatedText, setTranslatedText] = useState("")
    const [isTranslating, setIsTranslating] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [inputElement, setInputElement] = useState<HTMLElement | null>(null)

    // Debug logs
    const [debugLogs, setDebugLogs] = useState<string[]>([])
    const addLog = (msg: string) => {
        setDebugLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10))
    }

    // Settings
    const [targetLang, setTargetLang] = useState("JA")

    // Dragging state
    const [position, setPosition] = useState({ x: window.innerWidth - 450, y: window.innerHeight - 400 })
    const [isDragging, setIsDragging] = useState(false)
    const dragStartRef = useRef({ x: 0, y: 0 })

    useEffect(() => {
        // Load settings
        getTargetLang().then(setTargetLang)

        // Gemini's input field detection logic
        const findInput = () => {
            // Try multiple selectors to be robust against Gemini DOM changes
            const selectors = [
                "div[contenteditable='true']",
                "div[role='textbox']",
                "textarea",
                "[aria-label*='prompt']", // Often used for accessiblity
                "[aria-label*='プロンプト']" // Japanese locale specific
            ]

            for (const selector of selectors) {
                const el = document.querySelector(selector) as HTMLElement
                if (el) {
                    if (el !== inputElement) {
                        addLog(`Input detected: ${selector}`)
                        console.log(`[Plasmo] Gemini input found via selector: "${selector}"`, el)
                        setInputElement(el)
                    }
                    return // Stop after finding the first match
                }
            }
        }

        // Initial check
        addLog("Overlay loaded. Finding input...")
        findInput()

        // Observer for dynamic loading
        const observer = new MutationObserver((mutations) => {
            findInput()
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true
        })

        return () => observer.disconnect()
    }, [inputElement])

    useEffect(() => {
        if (!inputElement) return

        const handleInput = async (e: Event) => {
            const text = (e.target as HTMLElement).innerText
            setInputText(text)
            setErrorMessage("")

            if (text.trim().length > 2) {
                setIsTranslating(true)
                addLog(`Requesting translate for: "${text.substring(0, 10)}..."`)

                try {
                    // Use background worker to bypass CORS/CSP
                    const response = await sendToBackground({
                        name: "translate",
                        body: {
                            text,
                            sourceLang: "auto",
                            targetLang
                        }
                    }) as { text?: string; error?: string }

                    addLog(`Response Rx: ${JSON.stringify(response)}`)

                    if (response.error) {
                        throw new Error(response.error)
                    }

                    if (response.text === undefined) {
                        addLog("WARN: Response text undefined")
                    }

                    setTranslatedText(response.text || "")
                } catch (error) {
                    addLog(`ERR: ${error.message}`)
                    setErrorMessage("Error: " + (error.message || "Unknown"))
                    setTranslatedText("")
                } finally {
                    setIsTranslating(false)
                }
            } else {
                setTranslatedText("")
            }
        }

        inputElement.addEventListener("input", handleInput)
        return () => {
            inputElement.removeEventListener("input", handleInput)
        }
    }, [inputElement, targetLang])

    const applyTranslation = () => {
        if (inputElement && translatedText) {
            inputElement.innerText = translatedText
            inputElement.dispatchEvent(new Event('input', { bubbles: true }))
        }
    }

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        }
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragStartRef.current.x,
                    y: e.clientY - dragStartRef.current.y
                })
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isDragging])


    if (!inputElement) return null

    // Render overlay with "Editorial Brutalism" design
    return (
        <div
            style={{ left: position.x, top: position.y, backgroundColor: "white" }}
            className="fixed z-50 w-[400px] font-sans border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black p-6"
        >
            <div
                className="flex justify-between items-center mb-4 border-b-2 border-black pb-2 cursor-move select-none active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                title="Drag to move"
            >
                <h3 className="text-xl font-bold uppercase tracking-tighter pointer-events-none">Plasmo Translator</h3>
                <div className="bg-black text-[#f4f4f0] text-xs px-2 py-1 font-mono pointer-events-none">v0.2.1-debug</div>
            </div>

            <div className="mb-4">
                <div className="text-xs font-bold uppercase mb-1 tracking-wide">Detected Input</div>
                <div className="bg-white border-2 border-black p-3 min-h-[60px] max-h-[120px] overflow-y-auto text-sm font-medium">
                    {inputText ? inputText : <span className="text-gray-400 italic">Start typing in Gemini...</span>}
                </div>
            </div>

            <div className="mb-6">
                <div className="text-xs font-bold uppercase mb-1 tracking-wide flex justify-between">
                    <span>Translation Output</span>
                    <span className="bg-black text-white px-1">{targetLang}</span>
                </div>

                {errorMessage ? (
                    <div className="bg-red-100 border-2 border-red-500 p-3 min-h-[60px] text-sm font-bold text-red-900">
                        {errorMessage}
                    </div>
                ) : (
                    <div className={`bg-white border-2 border-black p-3 min-h-[60px] text-sm font-bold transition-all ${isTranslating ? "opacity-50" : "opacity-100"}`}>
                        {isTranslating ? "PROCESSING..." : translatedText || "..."}
                    </div>
                )}
            </div>

            <button
                onClick={applyTranslation}
                disabled={!translatedText}
                className="w-full bg-black text-[#f4f4f0] border-2 border-transparent hover:bg-[#f4f4f0] hover:text-black hover:border-black active:translate-y-1 active:shadow-none py-3 font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] mb-4"
            >
                Apply Translation
            </button>

            {/* Debug Console */}
            <div className="border-t-2 border-dashed border-gray-400 pt-2">
                <div className="text-[10px] font-bold uppercase text-gray-500 mb-1">Debug Logs</div>
                <div className="bg-gray-100 p-2 h-24 overflow-y-auto font-mono text-[10px] text-gray-700">
                    {debugLogs.length === 0 && <div className="italic text-gray-400">No logs yet...</div>}
                    {debugLogs.map((log, i) => (
                        <div key={i} className="mb-1 border-b border-gray-200 pb-1 last:border-0">{log}</div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default GeminiOverlay

