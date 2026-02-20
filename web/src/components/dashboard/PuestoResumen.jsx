import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

export function PuestoResumen({ puesto }) {
    const { codigo, nombre, totalMesas, mesasReportadas, porcentaje } = puesto;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{codigo}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{nombre}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mesasReportadas}/{totalMesas}
                    </p>
                    <p className="text-xs text-gray-500">mesas</p>
                </div>
            </div>

            {/* Barra de progreso */}
            <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${porcentaje}%` }}
                />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
                <span className={`font-medium ${porcentaje === 100 ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>
                    {porcentaje.toFixed(1)}% completado
                </span>
                {porcentaje === 100 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                    <Clock className="h-4 w-4 text-orange-500" />
                )}
            </div>
        </div>
    );
}
