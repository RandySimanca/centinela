import React from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export function ImageModal({ imageUrl, images, isOpen, onClose, title = "Foto del Formulario E-14", mesa, puestoNombre }) {
    if (!isOpen) return null;

    const [loading, setLoading] = React.useState(false);
    const [fetchedImages, setFetchedImages] = React.useState([]);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Normalizar imágenes a un array (Prioridad: Props > Firestore Fetch)
    // Si se pasan imágenes por props (legacy o cargadas previamente), usarlas.
    const propImages = images || (imageUrl ? [imageUrl] : []);
    const hasPropImages = propImages.length > 0;

    // Usar fetchedImages si no hay props, de lo contrario propImages
    const allImages = hasPropImages ? propImages : fetchedImages;

    // Resetear y Cargar
    React.useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);

            // Si no hay imágenes por props y tenemos mesa, cargar de Firestore
            if (!hasPropImages && mesa?.id) {
                loadImagesFromFirestore();
            }
        } else {
            // Limpiar estado al cerrar
            setFetchedImages([]);
            setCurrentIndex(0);
        }
    }, [isOpen, mesa, hasPropImages]); // Agregar hasPropImages a dependencias

    const loadImagesFromFirestore = async () => {
        try {
            setLoading(true);
            const fotosRef = collection(db, 'conteos', mesa.id, 'fotos');
            // Ordenar por índice si es posible, o por timestamp
            // Nota: Si no hay índice guardado, el orden puede variar. 
            // Asumimos que guardamos 'index' en mobile.
            const q = query(fotosRef, orderBy('index'));

            const snapshot = await getDocs(q);
            const loadedImages = snapshot.docs.map(doc => doc.data().base64);

            if (loadedImages.length > 0) {
                setFetchedImages(loadedImages);
            } else {
                // Fallback: intentar cargar sin orden (si falla index)
                const snapshotFallback = await getDocs(collection(db, 'conteos', mesa.id, 'fotos'));
                setFetchedImages(snapshotFallback.docs.map(doc => doc.data().base64));
            }
        } catch (error) {
            console.error("Error cargando fotos del E-14:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-700 dark:text-gray-300">Cargando evidencia...</span>
                </div>
            </div>
        );
    }

    // Si no está abierto, no renderizar nada
    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-700 dark:text-gray-300">Cargando evidencia...</span>
                </div>
            </div>
        );
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Si terminó de cargar y no hay imágenes, mostrar mensaje
    if (allImages.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={handleBackdropClick}>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-sm w-full text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sin evidencia</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No se encontraron fotos del formulario E-14 para esta mesa.
                    </p>
                </div>
            </div>
        );
    }

    const currentImg = allImages[currentIndex];

    const handleDownload = () => {
        // Crear un link temporal para descargar la imagen actual
        const link = document.createElement('a');
        link.href = currentImg;

        // Generar nombre de archivo descriptivo
        let fileName = 'formulario-e14';
        if (puestoNombre && mesa?.numero) {
            // Limpiar solo caracteres problemáticos
            const puestoLimpio = puestoNombre.replace(/[\/\\:*?"<>|]/g, '');
            fileName = `e14-puesto-${puestoLimpio}-mesa-${mesa.numero}-pag-${currentIndex + 1}`;
        } else if (mesa?.numeroGlobal) {
            fileName = `e14-mesa-global-${mesa.numeroGlobal}-pag-${currentIndex + 1}`;
        } else {
            fileName = `e14-${Date.now()}`;
        }

        link.download = `${fileName}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };



    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="relative max-w-6xl w-full h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                        {allImages.length > 1 && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Página {currentIndex + 1} de {allImages.length}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Descargar
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Imagen y controles */}
                {/* Imagen y controles */}
                <div className="relative flex-1 min-h-0 flex flex-col bg-gray-100 dark:bg-gray-900">
                    {/* Botones de navegación */}
                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
                            >
                                <ChevronRight className="h-8 w-8" />
                            </button>
                        </>
                    )}

                    {/* Contenedor con Scroll únicamente vertical */}
<div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
    <div className="w-full flex justify-center p-6 md:p-10"> 
        <img
            src={currentImg}
            alt={`${title} - Página ${currentIndex + 1}`}
            /* CONSEJO TÉCNICO: 
               - 'max-w-2xl' limita el ancho a unos 672px (aprox el tercio menos que pedías).
               - 'w-full' asegura que en pantallas pequeñas se adapte.
               - 'h-auto' mantiene la proporción para que el scroll vertical funcione.
            */
            className="w-full max-w-2xl h-auto shadow-2xl rounded-sm bg-white"
            style={{
                display: 'block',
                minHeight: 'min-content'
            }}
        />
    </div>
</div>
                </div>
            </div>
        </div>
    );
}
