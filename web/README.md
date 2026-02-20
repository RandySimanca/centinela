# Centinela - Dashboard Web

Este es el panel de administración del **Sistema de Conteo Electoral Municipal**. Desde aquí se gestionan los datos maestros y se visualizan los resultados en tiempo real.

## 🚀 Tecnologías
- **React 19** + **Vite**
- **Tailwind CSS** para el diseño.
- **Firebase SDK** para la conexión con Firestore.
- **Lucide React** para iconografía.

## 📦 Características
- **Dashboard**: Resumen visual de la votación por puesto y mesa.
- **Gestión de Usuarios**: Registro y control de acceso para testigos y administradores.
- **Gestión de Candidatos**: Configuración de los participantes en la contienda.
- **Ingreso de Votos**: Interfaz alternativa para cargar datos manualmente.

## 🛠️ Desarrollo

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Construir para producción:
   ```bash
   npm run build
   ```

## 📁 Estructura de carpetas
- `src/pages`: Vistas principales de la aplicación.
- `src/components`: Componentes reutilizables de UI.
- `src/context`: Gestión del estado global (Autenticación).
- `src/firebase.js`: Configuración del cliente Firebase.

