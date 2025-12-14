import React from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export const TemplateScreen: React.FC = () => {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Button fullWidth>+ NEW TEMPLATE</Button>

            <Card title="Business Email">
                <p style={{ margin: 0 }}>Dear [Name],\n\nI am writing to inquire about...</p>
            </Card>

            <Card title="Meeting Request">
                <p style={{ margin: 0 }}>Could we schedule a meeting next week to discuss...</p>
            </Card>
        </div>
    );
};
