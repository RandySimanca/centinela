import React from 'react';
import { Loader2 } from 'lucide-react';

export function StatCard({ title, value, subtitle, icon: Icon, loading = false, className = '' }) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    {loading ? (
                        <Loader2 className="h-6 w-6 mt-2 animate-spin text-gray-400" />
                    ) : (
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
                    )}
                </div>
                {Icon && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                )}
            </div>
            {subtitle && !loading && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
