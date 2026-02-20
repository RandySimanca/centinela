import React from 'react';

export function CandidateProgress({ name, partido, votes, percentage, color, position }) {
    // Asegurar que el porcentaje es un número válido
    const safePercentage = isNaN(percentage) ? 0 : percentage;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-all hover:shadow-md">
            {/* Background bar indicating progress visually behind everything (optional design choice, kept simple here as a foreground bar) */}

            <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-sm`} style={{ backgroundColor: color }}>
                        {position}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{name}</h4>
                        <p className="text-xs text-gray-500">{partido}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-xl text-gray-900 dark:text-white">{votes.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">votos</p>
                </div>
            </div>

            <div className="relative h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${safePercentage}%`, backgroundColor: color }}
                />
            </div>

            <div className="mt-1 text-right">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{safePercentage.toFixed(2)}%</span>
            </div>
        </div>
    );
}
