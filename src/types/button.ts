export interface button {
    children: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit';
    disabled?: boolean;
    onClick?: () => void;
}