import type { PlasmoMessaging } from "@plasmohq/messaging"
import { translateText } from "~lib/api/translate"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.log("[Plasmo Background] Received translate request:", req.body)
    const { text, sourceLang, targetLang } = req.body

    if (!text) {
        console.warn("[Plasmo Background] No text provided")
        res.send({ error: "No text provided" })
        return
    }

    try {
        const translated = await translateText(text, sourceLang, targetLang)
        console.log("[Plasmo Background] Translation success:", translated)
        res.send({ text: translated })
    } catch (error) {
        console.error("[Plasmo Background] Translation Error:", error)
        res.send({ error: error.message || "Translation failed" })
    }
}

export default handler
