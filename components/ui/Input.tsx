import React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    fullWidth?: boolean
}

export const Input: React.FC<InputProps> = ({ fullWidth, style, ...props }) => {
    return (
        <input
            style={{
                padding: "12px",
                fontSize: "16px",
                fontFamily: "var(--font-body)",
                border: "var(--border-width) solid var(--border-color)",
                borderRadius: "var(--radius)",
                width: fullWidth ? "100%" : "auto",
                outline: "none",
                boxShadow: "none",
                transition: "box-shadow 0.1s ease",
                ...style
            }}
            onFocus={(e) => {
                e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--border-color)"
            }}
            onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none"
            }}
            {...props}
        />
    )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    fullWidth?: boolean
}

export const Textarea: React.FC<TextareaProps> = ({ fullWidth, style, ...props }) => {
    return (
        <textarea
            style={{
                padding: "12px",
                fontSize: "16px",
                fontFamily: "var(--font-body)",
                border: "var(--border-width) solid var(--border-color)",
                borderRadius: "var(--radius)",
                width: fullWidth ? "100%" : "auto",
                minHeight: "100px",
                resize: "vertical",
                outline: "none",
                boxShadow: "none",
                transition: "box-shadow 0.1s ease",
                ...style
            }}
            onFocus={(e) => {
                e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--border-color)"
            }}
            onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none"
            }}
            {...props}
        />
    )
}
