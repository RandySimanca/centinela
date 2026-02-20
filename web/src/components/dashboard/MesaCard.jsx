import React, { useState } from 'react';
import { CheckCircle, Clock, Image as ImageIcon } from 'lucide-react';
import { ImageModal } from '../ImageModal';

export function MesaCard({ mesa, puestoNombre, conteo, candidates }) {
    const reportada = !!conteo;
    const [showImageModal, setShowImageModal] = useState(false);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-5 transition-all ${reportada
            ? 'border-green-200 dark:border-green-800'
            : 'border-orange-200 dark:border-orange-800'
            }`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">
                        Puesto de Votación
                    </p>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-2">
                        {puestoNombre}
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Mesa #{mesa.numero}
                        </span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500 italic">
                            Global: {mesa.numeroGlobal}
                        </span>
                    </div>
                </div>
                <div className="shrink-0">
                    {reportada ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Reportada
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Clock className="h-3.5 w-3.5" />
                            Pendiente
                        </span>
                    )}
                </div>
            </div>

            {/* Contenido */}
            {reportada ? (
                <div className="space-y-3">
                    {/* Votos por candidato */}
                    <div className="space-y-2">
                        {candidates.map(cand => {
                            const votos = conteo.porCandidato[cand.id] || 0;
                            return (
                                <div key={cand.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: cand.color }}
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {cand.nombre}
                                        </span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {votos.toLocaleString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Otros votos */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Votos en Blanco</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {conteo.votosBlanco.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Votos Nulos</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {conteo.votosNulos.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Votos No Marcados</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {conteo.votosNoMarcados.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900 dark:text-white">Total E-14</span>
                            <span className="text-xl font-bold text-blue-600">
                                {conteo.sumaTotal.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Foto del Formulario E-14 */}
                    {(conteo.fotosE14?.length > 0 || conteo.fotoE14 || conteo.photoCount > 0 || conteo.hasPhotos) ? (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Foto Formulario E-14
                                </p>
                                {(conteo.photoCount > 1 || conteo.fotosE14?.length > 1) && (
                                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                                        {conteo.photoCount || conteo.fotosE14?.length} páginas
                                    </span>
                                )}
                            </div>

                            {/* Mostrar Thumbnail si existe (Legacy o cargado) O Botón de Carga si está en subcolección */}
                            {(conteo.fotosE14 || conteo.fotoE14) ? (
                                <img
                                    src={conteo.fotosE14 ? conteo.fotosE14[0] : conteo.fotoE14}
                                    alt="Formulario E-14"
                                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                                    onClick={() => setShowImageModal(true)}
                                />
                            ) : (
                                <div
                                    className="w-full h-32 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-dashed border-gray-300 dark:border-gray-600"
                                    onClick={() => setShowImageModal(true)}
                                >
                                    <ImageIcon className="h-8 w-8 text-blue-500 mb-2" />
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Ver Evidencia Digital</span>
                                    <span className="text-[10px] text-gray-500">
                                        Click para cargar fotos
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <ImageIcon className="h-4 w-4 text-gray-400" />
                                <p className="text-xs text-gray-400 dark:text-gray-500">Sin foto adjunta</p>
                            </div>
                        </div>
                    )}

                    {/* Modal de imagen */}
                    {(conteo.fotosE14?.length > 0 || conteo.fotoE14 || conteo.photoCount > 0 || conteo.hasPhotos) && (
                        <ImageModal
                            imageUrl={conteo.fotosE14 ? conteo.fotosE14[0] : conteo.fotoE14}
                            images={conteo.fotosE14 || [conteo.fotoE14].filter(Boolean)}
                            isOpen={showImageModal}
                            onClose={() => setShowImageModal(false)}
                            title={`Formulario E-14 - Mesa #${mesa.numero} (Global: ${mesa.numeroGlobal})`}
                            mesa={mesa} // ImageModal usará mesa.id para fetching
                            puestoNombre={puestoNombre}
                        />
                    )}
                </div>
            ) : (
                <div className="py-8 text-center text-gray-400 dark:text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin reportar</p>
                </div>
            )}
        </div>
    );
}
