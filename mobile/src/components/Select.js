import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';

export function Select({ label, value, options, onSelect, placeholder = "Seleccionar...", error, icon }) {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <View className="mb-4">
            {label && <Text className="text-slate-700 font-medium mb-1.5 ml-1">{label}</Text>}

            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className={`bg-white border ${error ? 'border-red-500' : 'border-slate-200'} p-4 rounded-xl flex-row items-center shadow-sm`}
            >
                {icon && <View className="mr-3">{icon}</View>}
                <View className="flex-1 flex-row items-center justify-between">
                    <Text className={selectedOption ? "text-slate-900" : "text-slate-400"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </Text>
                    <ChevronDown size={20} color="#64748b" />
                </View>
            </TouchableOpacity>

            {error && <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl h-[70%]">
                        <View className="p-4 border-b border-slate-100 flex-row justify-between items-center">
                            <Text className="text-lg font-bold text-slate-900">{label || "Seleccionar"}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className="text-blue-600 font-bold">Cerrar</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        onSelect(item.value);
                                        setModalVisible(false);
                                    }}
                                    className="p-4 border-b border-slate-50 flex-row justify-between items-center"
                                >
                                    <Text className={`text-base ${item.value === value ? "text-blue-600 font-bold" : "text-slate-700"}`}>
                                        {item.label}
                                    </Text>
                                    {item.value === value && <Check size={20} color="#2563eb" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
}
