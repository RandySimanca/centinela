module.exports = function (api) {
    api.cache(true);

    const config = {
        presets: ["babel-preset-expo"],
        plugins: [],
    };

    // Intentar cargar NativeWind solo si está disponible
    try {
        require.resolve("nativewind/babel");
        config.presets = [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ];
    } catch (error) {
        console.warn("NativeWind not available locally, will be installed in EAS Build");
    }

    // Intentar cargar reanimated plugin solo si está disponible
    try {
        require.resolve("react-native-reanimated/plugin");
        config.plugins.push("react-native-reanimated/plugin");
    } catch (error) {
        // Reanimated plugin not available, that's ok
    }

    return config;
};
