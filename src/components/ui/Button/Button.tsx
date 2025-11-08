import React from 'react'

interface ButtonProps {
    children: React.ReactNode
    className?: string
    type?: 'button' | 'submit'
    disabled?: boolean
    onClick?: () => void
}

const Button = (props : ButtonProps) => {
    const { children, className, type = 'button', disabled = false, onClick } = props

    return (
        <button className={className} type={type} disabled={disabled} onClick={onClick}>{children}</button>
    )
}

export default Button