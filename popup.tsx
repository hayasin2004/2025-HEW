import React, { useState } from "react"
import "./style.css"
import { AuthProvider } from "./contexts/AuthContext"
import { TranslateScreen } from "./features/translate/TranslateScreen"
import { HistoryScreen } from "./features/history/HistoryScreen"
import { TemplateScreen } from "./features/templates/TemplateScreen"
import { Button } from "./components/ui/Button"

function IndexPopup() {
  const [view, setView] = useState<"TRANSLATE" | "HISTORY" | "TEMPLATES">("TRANSLATE")

  return (
    <AuthProvider>
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "500px" }}>

        {/* Header */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #000",
          paddingBottom: "12px"
        }}>
          <h1 style={{ fontSize: "20px", margin: 0 }}>PLASMO TRANS</h1>
          <div style={{ width: "10px", height: "10px", background: "#000" }}></div>
        </header>

        {/* Navigation */}
        <nav style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          <Button
            variant={view === "TRANSLATE" ? "primary" : "secondary"}
            onClick={() => setView("TRANSLATE")}
            style={{ padding: "8px", fontSize: "12px" }}
          >
            TRANS
          </Button>
          <Button
            variant={view === "HISTORY" ? "primary" : "secondary"}
            onClick={() => setView("HISTORY")}
            style={{ padding: "8px", fontSize: "12px" }}
          >
            HISTORY
          </Button>
          <Button
            variant={view === "TEMPLATES" ? "primary" : "secondary"}
            onClick={() => setView("TEMPLATES")}
            style={{ padding: "8px", fontSize: "12px" }}
          >
            TEMPLATES
          </Button>
        </nav>

        {/* Content */}
        <main style={{ flex: 1 }}>
          {view === "TRANSLATE" && <TranslateScreen />}
          {view === "HISTORY" && <HistoryScreen />}
          {view === "TEMPLATES" && <TemplateScreen />}
        </main>

        <footer style={{ marginTop: "auto", fontSize: "12px", color: "#666", textAlign: "center" }}>
          © 2025 Plasmo Translation Tool
        </footer>
      </div>
    </AuthProvider>
  )
}

export default IndexPopup
