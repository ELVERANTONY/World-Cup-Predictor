<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/0/05/2026_FIFA_World_Cup_logo.svg/1200px-2026_FIFA_World_Cup_logo.svg.png" alt="World Cup 2026 Logo" width="150" />

  # 🏆 World Cup Predictor 2026

  **La plataforma definitiva para predecir, competir y vivir la pasión de la Copa Mundial de la FIFA 2026.**

  [![React](https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express.js-black.svg?style=for-the-badge&logo=express)](https://expressjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  
</div>

---

## 📖 Acerca del Proyecto

**World Cup Predictor 2026** es una aplicación Full-Stack de alto rendimiento diseñada para crear comunidades alrededor de los pronósticos de la Copa Mundial. Permite a los usuarios predecir resultados de la fase de grupos y eliminatorias, crear salas privadas para competir con amigos y visualizar el avance real del torneo en un árbol interactivo con animaciones avanzadas y un diseño inmersivo y responsivo.

### ✨ Características Principales

- 🔐 **Autenticación Segura:** Sistema de login robusto mediante JWT y soporte para Google OAuth 2.0.
- 🏟️ **Árbol de Torneo Interactivo:** Visualización dinámica de los emparejamientos desde Octavos hasta la Gran Final, con animaciones fluidas y efectos de celebración inmersivos.
- 🏆 **Sistema de Salas (Rooms):** Crea salas privadas o únete a ellas mediante códigos únicos para competir en tablas de clasificación cerradas con tus amigos o compañeros de trabajo.
- 📊 **Rankings y Estadísticas:** Tablas de posiciones globales, semanales, y mensuales en tiempo real.
- 💻 **Panel de Administración:** Dashboard dedicado para la gestión integral de equipos, estadios, usuarios y la actualización en vivo de los resultados oficiales del torneo.

---

## 🛠️ Stack Tecnológico

El proyecto está estructurado como un monorepo ligero bajo un modelo cliente-servidor moderno:

### Frontend
- **Core:** React 18 (SPA) montado sobre Vite para tiempos de compilación ultrarrápidos y HMR.
- **Lenguaje:** TypeScript estricto.
- **Estilos e UI:** Tailwind CSS, `framer-motion` (animaciones fluidas), `canvas-confetti` (interactividad de victoria).
- **Gestión de Estado y Fetching:** React Query (`@tanstack/react-query`) para un óptimo manejo de caché y sincronización con el servidor.
- **Enrutamiento:** React Router DOM v6.

### Backend
- **Core:** Node.js + Express.js.
- **Lenguaje:** TypeScript.
- **Base de Datos:** PostgreSQL.
- **ORM:** Prisma (Validación y tipado seguro de extremo a extremo de la base de datos).
- **Seguridad:** JSON Web Tokens (JWT) para gestión de sesiones y `bcrypt` para el hash seguro de contraseñas.

---

## 📂 Arquitectura y Directorios

```text
├── backend-predicciones-mundial/  # API RESTful (Node.js + Express)
│   ├── prisma/                    # Esquemas de la DB y scripts de migraciones
│   ├── src/
│   │   ├── controllers/           # Lógica de rutas y controladores
│   │   ├── routes/                # Definición de endpoints API
│   │   ├── services/              # Reglas de negocio e interacción con Base de Datos
│   │   └── index.ts               # Punto de entrada y configuración del servidor
│   └── .env.example
│
└── frontend-predicciones-mundial/ # Aplicación Cliente SPA (React)
    ├── src/
    │   ├── components/            # Componentes reutilizables de Interfaz de Usuario
    │   ├── features/              # Componentes encapsulados por dominio (Landing, Auth, Dashboard, etc.)
    │   ├── hooks/                 # Custom Hooks y configuraciones de React Query
    │   ├── pages/                 # Vistas principales para el enrutador
    │   └── services/              # Clientes de consumo de API vía Axios
    └── tailwind.config.ts         # Sistema de diseño, paleta de colores y utilidades
```

---

## 🚀 Guía de Instalación (Entorno de Desarrollo)

### Requisitos Previos
- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [PostgreSQL](https://www.postgresql.org/) (Ejecutándose localmente o un clúster en la nube como Supabase/Neon)
- Gestor de paquetes `npm` o `pnpm`.

### 1. Configuración del Servidor (Backend)

```bash
cd backend-predicciones-mundial

# Instalar dependencias del servidor
npm install

# Copiar el archivo de entorno y configurar credenciales
cp .env.example .env
```
Abre `.env` e ingresa tu URL de conexión de PostgreSQL en `DATABASE_URL` y crea un `JWT_SECRET` seguro.

```bash
# Generar cliente de Prisma y sincronizar esquema con la Base de Datos
npx prisma generate
npx prisma db push

# (Opcional) Llenar la base de datos con equipos y partidos iniciales
npm run seed

# Levantar el servidor en modo desarrollo
npm run dev
```
*La API REST estará disponible en `http://localhost:3000`*

### 2. Configuración del Cliente (Frontend)

En una nueva pestaña de la terminal, ve al directorio raíz del frontend.

```bash
cd frontend-predicciones-mundial

# Instalar dependencias del cliente
npm install  # (o usar pnpm install si prefieres)

# Copiar configuración de variables de entorno
cp .env.example .env
```
Verifica que en el archivo `.env` la variable `VITE_API_URL` apunte al backend (ej. `http://localhost:3000/api`).

```bash
# Iniciar servidor de desarrollo de Vite
npm run dev
```
*La aplicación web estará disponible en `http://localhost:5173`*

---

## 🔑 Credenciales de Acceso Local

Si decidiste ejecutar el script de *seeding* en el backend, se crearán cuentas predeterminadas para que puedas probar todos los flujos de la aplicación inmediatamente:

| Rol de Usuario | Correo Electrónico | Contraseña | Descripción |
| --- | --- | --- | --- |
| 👑 **Administrador** | `admin@worldcup.com` | `password123` | Tiene acceso al Panel Admin para actualizar marcadores. |
| 👤 **Usuario Regular** | `user1@example.com` | `password123` | Jugador normal (predicciones, unirse a salas, etc). |

> **Advertencia:** Estas credenciales son de dominio público y están configuradas exclusivamente para pruebas locales. **Deberás eliminarlas o cambiarlas en un entorno de producción.**

---

## 🌐 Lineamientos de Despliegue (Producción)

El proyecto está optimizado para flujos de integración continua y despliegue rápido:

- **Frontend:** Genera la carpeta optimizada con `npm run build`. Puedes desplegarla en plataformas estáticas o Edge como [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/) o [Cloudflare Pages](https://pages.cloudflare.com/).
- **Backend:** Puedes empaquetar el servidor en un contenedor Docker o desplegarlo en servicios administrados (PaaS) como [Render](https://render.com/), [Railway](https://railway.app/) o [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform).
- **Base de Datos:** Asegúrate de usar una base de datos PostgreSQL productiva que garantice alta disponibilidad, como [Supabase](https://supabase.com/) o AWS RDS.

---

<div align="center">
  <i>Construido con pasión para la comunidad de entusiastas del fútbol mundial.</i>
</div>
