
import type { button } from '../../../types/button'

const Button = (props: button) => {
    const { children, className, type = 'button', disabled = false, onClick } = props

    return (
        <button className={className} type={type} disabled={disabled} onClick={onClick}>{children}</button>
    )
}

export default Button