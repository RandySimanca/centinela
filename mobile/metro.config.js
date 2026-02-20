const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Intentar cargar NativeWind solo si está disponible
try {
    const { withNativeWind } = require("nativewind/metro");
    module.exports = withNativeWind(config, { input: "./global.css" });
} catch (error) {
    // Si NativeWind no está disponible localmente, usar config por defecto
    // Esto permitirá que EAS lea el archivo localmente sin errores
    console.warn("NativeWind not available locally, will be installed in EAS Build");
    module.exports = config;
}