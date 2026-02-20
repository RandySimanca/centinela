# Centinela - App Móvil

Aplicación móvil para testigos electorales vinculada al **Sistema de Conteo Electoral Municipal**. Diseñada para facilitar el reporte de votos de manera rápida y segura.

## 🚀 Tecnologías
- **React Native** + **Expo**
- **Expo Router** para la navegación.
- **NativeWind** para los estilos.
- **Firebase SDK** para la sincronización de datos.

## 📦 Características
- **Inicio de Sesión**: Acceso seguro para testigos autorizados.
- **Registro**: Permite a nuevos testigos enviar su solicitud de acceso.
- **Dashboard**: Vista rápida del estado del puesto asignado.
- **Ingreso de Votos**: Formulario optimizado para reportar resultados por mesa.
- **Estado de Espera**: Pantalla de espera para usuarios aún no validados por el administrador.

## 🛠️ Desarrollo

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar el entorno de Expo:
   ```bash
   npm run start
   ```

3. Ver en el teléfono:
   - Descarga la app **Expo Go** en tu dispositivo.
   - Escanea el código QR que aparecerá en la terminal.

## 📁 Estructura de carpetas
- `app/`: Directorio de archivos de la App (Expo Router).
- `app/(tabs)`: Pantallas principales accesibles mediante la barra de pestañas.
- `src/components`: Componentes visuales y de UI.
- `src/hooks`: Lógica de React personalizada.
- `src/firebase/`: Configuración y servicios de Firebase.
