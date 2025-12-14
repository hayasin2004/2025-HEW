import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = "primary", 
  fullWidth = false,
  style,
  ...props 
}) => {
  const baseStyle: React.CSSProperties = {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "bold",
    fontFamily: "var(--font-heading)",
    border: "var(--border-width) solid var(--border-color)",
    backgroundColor: variant === "primary" ? "#fff" : "transparent",
    color: "var(--text-color)",
    boxShadow: "var(--shadow-hard)",
    transition: "transform 0.1s ease, box-shadow 0.1s ease",
    width: fullWidth ? "100%" : "auto",
    ...style
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translate(2px, 2px)"
    e.currentTarget.style.boxShadow = "2px 2px 0px 0px var(--border-color)"
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translate(0, 0)"
    e.currentTarget.style.boxShadow = "var(--shadow-hard)"
  }

  return (
    <button 
      {...props} 
      style={baseStyle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {children}
    </button>
  )
}
