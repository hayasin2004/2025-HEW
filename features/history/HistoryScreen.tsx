import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { getHistory, type HistoryItem } from "../../lib/firestore";
import { useAuth } from "../../contexts/AuthContext";

export const HistoryScreen: React.FC = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getHistory(user.uid)
                .then(setHistory)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user]);

    if (!user) return <div style={{ padding: "16px" }}>Please log in to view history.</div>;
    if (loading) return <div style={{ padding: "16px" }}>Loading history...</div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {history.length === 0 ? (
                <p>No history yet.</p>
            ) : (
                history.map((item) => (
                    <Card key={item.id} style={{ padding: "12px" }}>
                        <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
                            {item.sourceLang} → {item.targetLang}
                        </div>
                        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{item.originalText}</div>
                        <div>{item.translatedText}</div>
                    </Card>
                ))
            )}
        </div>
    );
};
