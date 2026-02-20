# Centinela: Sistema de Conteo Electoral Municipal

**Centinela** es una plataforma integral (Híbrida Web + Móvil) diseñada para el seguimiento y conteo de votos en tiempo real durante procesos electorales municipales. Permite a los testigos electorales reportar datos directamente desde los puestos de votación y a los administradores visualizar los resultados consolidados de forma inmediata.

## 🚀 Arquitectura del Proyecto

El sistema se divide en tres componentes principales:

1.  **Dashboard Web (`/web`)**: Interfaz administrativa desarrollada con **React + Vite** para la gestión de usuarios, candidatos y visualización de estadísticas globales.
2.  **App Móvil (`/mobile`)**: Aplicación para testigos electorales construida con **React Native (Expo)**, permitiendo el ingreso de votos de forma ágil desde el territorio.
3.  **Backend & Scripts (`/scripts`)**: Lógica de servidor y herramientas de administración que interactúan directamente con **Firebase Firestore** para la persistencia y reglas de seguridad.

---

## 🛠️ Tecnologías

### Frontend & Mobile
- **Core**: React 19, React Native (Expo SDK 54).
- **Estilos**: Tailwind CSS (NativeWind en móvil).
- **Navegación**: React Router (Web), Expo Router (Móvil).
- **Iconos**: Lucide React.

### Backend (BaaS)
- **Base de Datos**: Firebase Firestore (NoSQL en tiempo real).
- **Autenticación**: Firebase Auth.
- **Scripts**: Node.js para inicialización y mantenimiento de datos.

---

## 📦 Estructura del Repositorio

- `mobile/`: Aplicación móvil multiplataforma.
- `web/`: Panel de administración web.
- `scripts/`: Herramientas para poblar datos, resetear estadísticas y simular votos.
- `firestore.rules`: Definición de la seguridad de la base de datos.

---

## ⚙️ Configuración y Despliegue

### 1. Requisitos Previos
- Node.js (v18 o superior).
- Una cuenta en [Firebase](https://console.firebase.google.com/).
- Proyecto de Firebase configurado con Firestore y Auth habilitados.

### 2. Inicialización de Datos (Backend)
Antes de usar las aplicaciones, debes poblar la base de datos:

1.  Descarga tu `serviceAccountKey.json` desde la consola de Firebase.
2.  Colócalo en la carpeta `scripts/`.
3.  Ejecuta los scripts:
    ```bash
    cd scripts
    npm install
    # Inicializar puestos y mesas
    node initializeData.js
    # (Opcional) Crear un usuario administrador inicial
    node createAdminUser.js
    ```

### 3. Ejecución del Dashboard Web
```bash
cd web
npm install
npm run dev
```

### 4. Ejecución de la App Móvil
```bash
cd mobile
npm install
npm run start
```
*Puedes usar un emulador o la app **Expo Go** en tu dispositivo físico.*

---

## 📝 Próximos Pasos
- [ ] Implementación de reportes en PDF y Excel desde la web.
- [ ] Optimización de la carga de imágenes para actas electorales.
- [ ] Refinamiento de la interfaz de usuario basada en retroalimentación de campo.

---

## 📄 Licencia
Este proyecto es de uso privado/interno para procesos de auditoría electoral.

