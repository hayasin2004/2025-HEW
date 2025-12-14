import { useEffect, useState } from "react"
import { getTargetLang, setTargetLang } from "~lib/storage"
import "./style.css"

const Options = () => {
    const [targetLang, setLocalTargetLang] = useState("JA")
    const [status, setStatus] = useState("")

    useEffect(() => {
        const loadSettings = async () => {
            const lang = await getTargetLang()
            setLocalTargetLang(lang)
        }
        loadSettings()
    }, [])

    const handleSave = async () => {
        await setTargetLang(targetLang)
        setStatus("Saved!")
        setTimeout(() => setStatus(""), 2000)
    }

    return (
        <div className="flex flex-col items-center justify-center" style={{ minHeight: "100vh", padding: "40px" }}>
            <div className="content-body p-5" style={{ width: "500px", border: "4px solid black", backgroundColor: "white", boxShadow: "8px 8px 0 0 black" }}>
                <h1 className="text-xl font-bold uppercase mb-4" style={{ borderBottom: "4px solid black", paddingBottom: "16px" }}>
                    Settings
                </h1>

                <div className="mb-4">
                    <label className="text-xs font-bold uppercase mb-2 block">
                        Target Language
                    </label>
                    <div className="w-full">
                        <select
                            value={targetLang}
                            onChange={(e) => setLocalTargetLang(e.target.value)}
                            className="input-box p-3 text-sm font-bold"
                            style={{ width: "100%", cursor: "pointer", appearance: "none" }}
                        >
                            <option value="JA">Japanese (日本語)</option>
                            <option value="EN">English (英語)</option>
                            <option value="ES">Spanish (スペイン語)</option>
                            <option value="FR">French (フランス語)</option>
                            <option value="ZH">Chinese (中国語)</option>
                            <option value="KO">Korean (韓国語)</option>
                            <option value="DE">German (ドイツ語)</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginTop: "32px" }}>
                    <button
                        onClick={handleSave}
                        className="btn-apply"
                        style={{ fontSize: "18px", padding: "16px" }}
                    >
                        {status || "Save Settings"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Options
