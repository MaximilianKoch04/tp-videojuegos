# GameVault — Marketplace y Catálogo de Videojuegos Full-Stack

Aplicación web full-stack de tipo **Marketplace y Catálogo Comunitario de Videojuegos** desarrollada con **React, TypeScript, Node.js, Express, MongoDB y Better Auth**.

## Enlaces en Producción (Render)

- **Frontend (Aplicación Web):** https://tp-videojuegos-frontend.onrender.com
- **Backend (API REST):** https://tp-videogames-backend.onrender.com



---

## Funcionalidades Principales

- **Autenticación Multi-Proveedor (Better Auth):**
  - Registro e inicio de sesión con Email y Contraseña.
  - Inicio de sesión social con **Google OAuth** y **GitHub OAuth**.
  - Manejo de sesiones seguras mediante cookies `Same-Origin` a través de reglas de *Rewrite* en Render.
- **Catálogo Público con Búsqueda, Filtros y Paginación:**
  - Exploración paginada (`GET /api/games`) desde MongoDB Atlas.
  - Búsqueda en tiempo real por título o desarrollador.
  - Filtro por género y vista rápida de **"Solo mis juegos"** para usuarios autenticados.
- **Modelo Marketplace y Propiedad de Registros (`userId` / `sellerName`):**
  - Cualquier usuario autenticado puede publicar nuevos videojuegos en el catálogo.
  - Control de propiedad en backend y frontend: los usuarios con rol `user` pueden editar o eliminar **únicamente sus propias publicaciones**.
- **Control de Acceso Basado en Roles (RBAC):**
  - **`user`:** Publica y administra sus propios videojuegos desde la sección *Mis Juegos*.
  - **`admin`:** Moderación global sobre todos los videojuegos del marketplace y panel de **Gestión de Usuarios y Roles** (`authClient.admin.setRole`) para promover o degradar usuarios en tiempo real.
- **Validación End-to-End:** Esquemas compartidos con **Zod** tanto en el frontend (`react-hook-form`) como en los endpoints del backend.

---

## Stack Tecnológico

- **Frontend:** React, TypeScript, Vite, React Router DOM, React Hook Form, Zod.
- **Backend:** Node.js, Express, TypeScript, Mongoose (MongoDB Atlas), Better Auth (`admin` plugin), Zod.
- **Despliegue:** Render (Static Site con proxy *Rewrite* para `/api/*` + Web Service Node.js).

---

## Estructura del Proyecto

```text
├── backend/
│   ├── src/
│   │   ├── config/        # Configuración de MongoDB y Better Auth (Google, GitHub, Admin)
│   │   ├── controllers/   # Lógica CRUD, paginación, filtros y validación de propiedad
│   │   ├── middlewares/   # Protección de rutas y verificación de sesión/roles
│   │   ├── models/        # Modelos Mongoose (Game)
│   │   ├── routes/        # Rutas REST (/api/games, /api/auth/*)
│   │   └── schemas/       # Validaciones con Zod
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/    # Navbar dinámico por rol y rutas protegidas (AdminRoute)
│   │   ├── lib/           # Cliente Better Auth (authClient + adminClient)
│   │   ├── pages/         # Catálogo paginado, Detalle, Login/Registro y Panel Admin/Mis Juegos
│   │   └── schemas/       # Tipos y esquemas Zod del frontend
│   └── vite.config.ts
└── README.md