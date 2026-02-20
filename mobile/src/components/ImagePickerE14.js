import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';

export function ImagePickerE14({ onImageSelected, currentImages = [] }) {
    const [loading, setLoading] = useState(false);

    const compressAndConvertToBase64 = async (uri) => {
        try {
            // Redimensionar a máximo 1280px de ancho manteniendo aspect ratio
            const manipResult = await manipulateAsync(
                uri,
                [{ resize: { width: 1280 } }],
                { compress: 0.7, format: SaveFormat.JPEG }
            );

            // Leer el archivo y convertir a Base64
            const response = await fetch(manipResult.uri);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result); // data:image/jpeg;base64,...
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error al comprimir imagen:', error);
            throw error;
        }
    };

    const handleImageSelection = async (uri) => {
        try {
            setLoading(true);
            const base64Image = await compressAndConvertToBase64(uri);

            // Agregar nueva imagen al array existente
            const newImages = [...(currentImages || []), base64Image];
            onImageSelected(newImages);
        } catch (error) {
            console.error('Error al procesar imagen:', error);
            Alert.alert('Error', 'No se pudo procesar la imagen. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const pickImageFromCamera = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso Requerido', 'Necesitamos acceso a la cámara.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                await handleImageSelection(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error al capturar imagen:', error);
        }
    };

    const pickImageFromLibrary = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso Requerido', 'Necesitamos acceso a tus fotos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                await handleImageSelection(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error al seleccionar imagen:', error);
        }
    };

    const removeImage = (indexToRemove) => {
        Alert.alert(
            'Eliminar Foto',
            '¿Estás seguro de eliminar esta foto?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        const newImages = currentImages.filter((_, index) => index !== indexToRemove);
                        onImageSelected(newImages);
                    }
                }
            ]
        );
    };

    return (
        <View className="mb-6">
            <Text className="text-base font-bold text-slate-900 mb-3">
                Fotos del Formulario E-14 <Text className="text-slate-500 text-sm font-normal">(Opcional)</Text>
            </Text>

            {/* Lista de imágenes */}
            <View className="flex-row flex-wrap gap-2 mb-4">
                {currentImages && currentImages.map((img, index) => (
                    <View key={index} className="relative w-[48%] aspect-[3/4] mb-2">
                        <Image
                            source={{ uri: img }}
                            className="w-full h-full rounded-xl border border-slate-200"
                            resizeMode="cover"
                        />
                        <View className="absolute top-2 right-2 flex-row gap-1">
                            <TouchableOpacity
                                onPress={() => removeImage(index)}
                                className="bg-red-600 rounded-full p-1.5 shadow-sm"
                            >
                                <X size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                        <View className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded">
                            <Text className="text-white text-xs font-bold">Pág {index + 1}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Botones de acción */}
            {loading ? (
                <View className="flex-row justify-center items-center py-4">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="ml-3 text-slate-600">Procesando imagen...</Text>
                </View>
            ) : (
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={pickImageFromCamera}
                        className="flex-1 flex-row items-center justify-center bg-blue-600 py-4 px-4 rounded-xl shadow-sm"
                    >
                        <Camera size={20} color="white" />
                        <Text className="text-white font-bold ml-2">Cámara</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={pickImageFromLibrary}
                        className="flex-1 flex-row items-center justify-center bg-slate-600 py-4 px-4 rounded-xl shadow-sm"
                    >
                        <ImageIcon size={20} color="white" />
                        <Text className="text-white font-bold ml-2">Galería</Text>
                    </TouchableOpacity>
                </View>
            )}

            {(!currentImages || currentImages.length === 0) && (
                <Text className="text-xs text-slate-500 mt-2 text-center">
                    Puedes adjuntar múltiples fotos si el E-14 tiene varias páginas
                </Text>
            )}

            {currentImages && currentImages.length > 0 && (
                <Text className="text-xs text-slate-500 mt-2 text-center">
                    {currentImages.length} foto{currentImages.length !== 1 ? 's' : ''} adjunta{currentImages.length !== 1 ? 's' : ''}
                </Text>
            )}
        </View>
    );
}
