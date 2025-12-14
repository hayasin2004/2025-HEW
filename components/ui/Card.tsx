import React from "react"

interface CardProps {
    children: React.ReactNode
    title?: string
    className?: string
    style?: React.CSSProperties
}

export const Card: React.FC<CardProps> = ({ children, title, style }) => {
    return (
        <div style={{
            border: "var(--border-width) solid var(--border-color)",
            backgroundColor: "#fff",
            boxShadow: "var(--shadow-hard)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            ...style
        }}>
            {title && (
                <h3 style={{ margin: 0, fontSize: "18px", borderBottom: "2px solid #000", paddingBottom: "8px" }}>
                    {title}
                </h3>
            )}
            {children}
        </div>
    )
}
