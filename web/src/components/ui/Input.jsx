import React from 'react';

export function Input({ label, error, className = '', id, ...props }) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${error ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                {...props}
            />
            {error && <span className="text-sm text-red-500">{error}</span>}
        </div>
    );
}
