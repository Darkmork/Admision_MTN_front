
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
    isRequired?: boolean;
}

const Input: React.FC<InputProps> = ({ label, id, error, isRequired, ...props }) => {
    return (
        <div className="w-full">
            <label htmlFor={id} className="block text-sm font-medium text-gris-piedra mb-1">
                {label} {isRequired && <span className="text-rojo-sagrado">*</span>}
            </label>
            <input
                id={id}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    error 
                        ? 'border-rojo-sagrado focus:ring-rojo-sagrado' 
                        : 'border-gray-300 focus:border-azul-monte-tabor focus:ring-azul-monte-tabor'
                }`}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-rojo-sagrado">{error}</p>}
        </div>
    );
};

export default Input;
