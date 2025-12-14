import { useEffect, useState } from "react"
import { getTargetLang, setTargetLang } from "~lib/storage"
import "~style.css"

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
        <div className="min-h-screen bg-[#f4f4f0] p-8 font-sans text-black flex justify-center items-start">
            <div className="w-[500px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8">
                <h1 className="text-3xl font-black uppercase mb-8 border-b-4 border-black pb-4 tracking-tighter">
                    Settings
                </h1>

                <div className="mb-8">
                    <label className="block text-sm font-bold uppercase mb-2 tracking-wide">
                        Target Language
                    </label>
                    <div className="relative">
                        <select
                            value={targetLang}
                            onChange={(e) => setLocalTargetLang(e.target.value)}
                            className="w-full appearance-none bg-[#f4f4f0] border-2 border-black p-4 text-base font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow cursor-pointer"
                        >
                            <option value="JA">Japanese (日本語)</option>
                            <option value="EN">English (英語)</option>
                            <option value="ES">Spanish (スペイン語)</option>
                            <option value="FR">French (フランス語)</option>
                            <option value="ZH">Chinese (中国語)</option>
                            <option value="KO">Korean (韓国語)</option>
                            <option value="DE">German (ドイツ語)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black font-bold">
                            ▼
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                        * Select the language you want to translate TO.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-black text-[#f4f4f0] border-2 border-transparent py-4 font-black uppercase tracking-widest text-lg hover:bg-[#f4f4f0] hover:text-black hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                >
                    {status || "Save Settings"}
                </button>
            </div>
        </div>
    )
}

export default Options
