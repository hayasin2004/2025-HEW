import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { translateText } from "../../lib/api/translate";
import { addHistory } from "../../lib/firestore";
import { useAuth } from "../../contexts/AuthContext";

export const TranslateScreen: React.FC = () => {
    const { user } = useAuth();
    const [inputText, setInputText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [loading, setLoading] = useState(false);
    const [targetLang, setTargetLang] = useState("EN");

    const handleTranslate = async () => {
        if (!inputText) return;
        setLoading(true);
        try {
            const result = await translateText(inputText, "JA", targetLang);
            setTranslatedText(result);

            // Save to history if logged in
            if (user) {
                await addHistory({
                    userId: user.uid,
                    originalText: inputText,
                    translatedText: result,
                    sourceLang: "JA",
                    targetLang: targetLang
                });
            }
        } catch (error) {
            console.error("Translation failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card>
                <label style={{ fontWeight: "bold" }}>Source Text</label>
                <Textarea
                    placeholder="Enter text to translate..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    fullWidth
                />
            </Card>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    style={{
                        padding: "8px",
                        border: "2px solid #000",
                        fontFamily: "var(--font-heading)",
                        fontWeight: "bold",
                        background: "#fff"
                    }}
                >
                    <option value="EN">English</option>
                    <option value="JA">Japanese</option>
                    <option value="ZH">Chinese</option>
                    <option value="KO">Korean</option>
                </select>
                <Button onClick={handleTranslate} disabled={loading}>
                    {loading ? "TRANSLATING..." : "TRANSLATE ->"}
                </Button>
            </div>

            {translatedText && (
                <Card title="Result">
                    <p style={{ margin: 0, fontSize: "16px", lineHeight: "1.5" }}>{translatedText}</p>
                </Card>
            )}
        </div>
    );
};
