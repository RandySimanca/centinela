import React from 'react';
import { TouchableOpacity, Text, TextInput, View, ActivityIndicator } from 'react-native';

export function Button({ onPress, title, variant = 'primary', isLoading = false, disabled = false, className = '' }) {
    const baseStyles = "py-4 px-6 rounded-xl flex-row items-center justify-center shadow-sm";
    const variants = {
        primary: "bg-blue-600",
        secondary: "bg-slate-600",
        outline: "bg-transparent border border-slate-300",
        danger: "bg-red-600"
    };

    const textStyles = variant === 'outline' ? "text-slate-700 font-bold text-lg" : "text-white font-bold text-lg";

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'outline' ? '#334155' : 'white'} />
            ) : (
                <Text className={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

export function Input({ label, error, icon, ...props }) {
    return (
        <View className="mb-4">
            {label && <Text className="text-slate-700 font-medium mb-1.5 ml-1">{label}</Text>}
            <View className={`bg-white border ${error ? 'border-red-500' : 'border-slate-200'} rounded-xl shadow-sm flex-row items-center px-4`}>
                {icon && <View className="mr-3">{icon}</View>}
                <TextInput
                    className="flex-1 py-4 text-slate-900"
                    placeholderTextColor="#94a3b8"
                    {...props}
                />
            </View>
            {error && <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>}
        </View>
    );
}
