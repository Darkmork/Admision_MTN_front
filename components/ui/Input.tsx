
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
    isRequired?: boolean;
    helpText?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, isRequired, helpText, ...props }) => {
    const errorId = error ? `${id}-error` : undefined;
    const helpTextId = helpText ? `${id}-help` : undefined;
    const describedBy = [errorId, helpTextId].filter(Boolean).join(' ') || undefined;

    return (
        <div className="w-full">
            <label htmlFor={id} className="block text-sm font-medium text-gris-piedra mb-1">
                {label} {isRequired && <span className="text-rojo-sagrado" aria-label="requerido">*</span>}
            </label>
            <input
                id={id}
                aria-label={label}
                aria-required={isRequired}
                aria-invalid={!!error}
                aria-describedby={describedBy}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    error
                        ? 'border-rojo-sagrado focus:ring-rojo-sagrado'
                        : 'border-gray-300 focus:border-azul-monte-tabor focus:ring-azul-monte-tabor'
                }`}
                {...props}
            />
            {error && <p id={errorId} className="mt-1 text-xs text-rojo-sagrado" role="alert">{error}</p>}
            {helpText && !error && <p id={helpTextId} className="mt-1 text-xs text-gray-500">{helpText}</p>}
        </div>
    );
};

export default Input;
