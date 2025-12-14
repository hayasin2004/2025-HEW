export const translateText = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    const apiKey = process.env.PLASMO_PUBLIC_DEEPL_API_KEY;
    if (!apiKey) {
        throw new Error("DeepL API key is missing");
    }

    const params = new URLSearchParams({
        auth_key: apiKey,
        text: text,
        // DeepL uses "EN" not "EN-US" generally, but supports "EN-US" as target. 
        // For simplicity we'll pass standard codes. DeepL is robust.
        target_lang: targetLang.toUpperCase(),
    });

    // Handle source language if provided and not auto
    if (sourceLang && sourceLang !== "auto") {
        params.append("source_lang", sourceLang.toUpperCase());
    }

    try {
        const response = await fetch("https://api-free.deepl.com/v2/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`DeepL API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        // DeepL returns { translations: [{ detected_source_language: "EN", text: "..." }] }
        if (data.translations && data.translations.length > 0) {
            return data.translations[0].text;
        }

        return text; // Fallback if no translation found
    } catch (error) {
        console.error("Translation failed:", error);
        throw error;
    }
};
