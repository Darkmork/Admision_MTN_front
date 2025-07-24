
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-blanco-pureza rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-2xl ${className}`}>
            {children}
        </div>
    );
};

export default Card;
