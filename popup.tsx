import { useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"
import "./style.css"

// --- TAB COMPONENTS ---

// 1. AI PROMPT TAB (Reads from Storage)
const AiPromptTab = () => {
  // Read state synced from Content Script
  const [aiState] = useStorage<{
    inputText: string;
    translatedText: string;
    targetLang: string;
    isTranslating: boolean;
    statusMessage?: string; // New field
    errorMessage: string;
  }>("aiPromptState", {
    inputText: "",
    translatedText: "",
    targetLang: "JA",
    isTranslating: false,
    statusMessage: "Idle",
    errorMessage: ""
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs font-bold uppercase" style={{ color: "#888" }}>Current Page Status</div>
      <div className="input-box p-3" style={{ minHeight: "60px", maxHeight: "100px", overflowY: "auto", fontSize: "14px", fontWeight: "600", fontFamily: "monospace" }}>
        {aiState.inputText ? aiState.inputText : <span className="italic" style={{ color: "#bbb" }}>No input detected on page...</span>}
      </div>

      {/* Status Bar */}
      <div className="flex justify-between items-center bg-gray-200 border-2 border-black p-1">
        <span className="text-xs font-bold uppercase px-2">STATUS:</span>
        <span className="text-xs font-mono font-bold uppercase bg-black text-white px-2 py-0.5 animate-pulse-slow">
          {aiState.statusMessage || "Idle"}
        </span>
      </div>

      <div>
        <div className="label-wrapper mb-1">
          <span className="text-xs font-bold uppercase">Output</span>
          <span className="lang-tag text-xs font-bold">{aiState.targetLang}</span>
        </div>
        {aiState.errorMessage ? (
          <div className="error-box text-sm">
            {aiState.errorMessage}
          </div>
        ) : (
          <div className="output-box p-3 text-sm font-bold" style={{ minHeight: "80px", transition: "opacity 0.2s", opacity: aiState.isTranslating ? 0.5 : 1 }}>
            {aiState.isTranslating ? "..." : aiState.translatedText || ""}
          </div>
        )}
      </div>

      <div className="text-xs italic text-center" style={{ color: "#999" }}>
        * Monitors Gemini input. Auto-translates after 4s pause.
      </div>
    </div>
  )
}

// 2. TRANS TAB (Manual Translation)
const TransTab = () => {
  const [manualInput, setManualInput] = useState("")
  const [manualOutput, setManualOutput] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [targetLang, setTargetLang] = useState("JA")

  const handleTranslate = async () => {
    if (!manualInput.trim()) return
    setIsTranslating(true)
    try {
      const response = await sendToBackground({
        name: "translate",
        body: { text: manualInput, sourceLang: "auto", targetLang }
      }) as { text?: string; error?: string }

      if (response.error) throw new Error(response.error)
      setManualOutput(response.text || "")
    } catch (error) {
      setManualOutput("Error: " + error.message)
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-bold uppercase mb-1 block">Source Text</label>
        <textarea
          className="input-box p-2 text-sm font-bold resize-none"
          placeholder="Enter text to translate..."
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          style={{ height: "100px" }}
        />
      </div>

      <div className="flex justify-between items-center">
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="input-box p-2 text-sm font-bold"
          style={{ width: "auto", minWidth: "120px" }}
        >
          <option value="JA">Japanese</option>
          <option value="EN">English</option>
          <option value="ES">Spanish</option>
          <option value="ZH">Chinese</option>
          <option value="KO">Korean</option>
        </select>

        <button
          onClick={handleTranslate}
          disabled={isTranslating || !manualInput}
          className="btn-primary"
        >
          {isTranslating ? "..." : "Translate ->"}
        </button>
      </div>

      <div className="mt-2">
        <div className="text-xs font-bold uppercase mb-1">Result</div>
        <div className="output-box p-3 text-sm font-bold" style={{ backgroundColor: "#f3f3f3", minHeight: "80px", whiteSpace: "pre-wrap" }}>
          {manualOutput || "..."}
        </div>
      </div>
    </div>
  )
}

// 3. PLACEHOLDER TAB
const PlaceholderTab = ({ title }: { title: string }) => (
  <div className="placeholder-tab">
    <span style={{ fontSize: "24px", marginBottom: "8px" }}>🚧</span>
    <h4 className="font-bold uppercase" style={{ color: "#777" }}>{title}</h4>
    <p className="text-xs" style={{ color: "#999" }}>Coming Soon</p>
  </div>
)

// --- MAIN POPUP ---

const Popup = () => {
  const [activeTab, setActiveTab] = useState<"trans" | "history" | "templates" | "aiprompt">("trans")

  const tabs = [
    { id: "trans", label: "TRANS" },
    { id: "history", label: "HISTORY" },
    { id: "templates", label: "TEMPLATES" },
    { id: "aiprompt", label: "AI PROMPT" }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="header p-4 flex justify-between items-center">
        <h3 className="text-xl font-bold uppercase" style={{ letterSpacing: "-1px" }}>Plasmo Trans v0.6</h3>
        <div className="square-icon"></div>
      </div>

      {/* Navigation */}
      <div className="nav-tabs flex">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`tab-btn text-xs font-bold uppercase ${activeTab === tab.id ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Body */}
      <div className="content-body p-5">
        {activeTab === "trans" && <TransTab />}
        {activeTab === "history" && <PlaceholderTab title="History" />}
        {activeTab === "templates" && <PlaceholderTab title="Templates" />}
        {activeTab === "aiprompt" && <AiPromptTab />}
      </div>

      {/* Footer */}
      <div className="footer text-center text-xs font-bold uppercase">
        © 2025 Plasmo Translation Tool
      </div>
    </div>
  )
}

export default Popup
