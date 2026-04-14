# ASESORIAS-82-IDGS
# 🎓 Sistema de Asesorías UTN

Sistema web para la gestión integral de tutorías y asesorías académicas de la Universidad Tecnológica de Nayarit.

---

## 🏗️ Arquitectura

```
utn-tutorias/
├── backend/          → Node.js + Express + MySQL
└── frontend/         → React + Vite
```

**Roles del sistema:**
- **Administrador** — Gestión total: usuarios, asignaciones, sesiones, justificantes, auditoría
- **Docente** — Crear sesiones, generar códigos de confirmación, registrar avances
- **Alumno** — Confirmar sesiones con código, ver avances, enviar justificantes

---

## ⚙️ Requisitos previos

- Node.js 18+
- MySQL 8.0+

---

## 🚀 Instalación

### 1. Base de datos MySQL

```sql
CREATE DATABASE utn_tutorias CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bash
cd backend
npm install

# Copiar y configurar variables de entorno
cp .env.example .env
# Edita .env con tus datos de MySQL y JWT secret

# Crear tablas e insertar admin por defecto
npm run migrate

# Iniciar servidor
npm run dev
```

El backend corre en `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
npm install

# Copiar y configurar variables de entorno
cp .env.example .env
# Configura tus credenciales de EmailJS

# Iniciar en desarrollo
npm run dev
```

El frontend corre en `http://localhost:5173`

---

## 📧 Configuración de EmailJS

1. Crea una cuenta en https://www.emailjs.com/
2. Crea un **Service** (Gmail, Outlook, etc.)
3. Crea una **Template** con estas variables:
   - `{{to_name}}` — Nombre del alumno
   - `{{to_email}}` — Email del alumno  
   - `{{docente_name}}` — Nombre del docente
   - `{{fecha}}` — Fecha de la sesión
   - `{{hora}}` — Hora de la sesión
   - `{{codigo}}` — **Código de confirmación** (en grande y visible)
   - `{{expira}}` — Fecha de expiración del código
4. Copia el **Service ID**, **Template ID** y **Public Key** a `frontend/.env`

**Ejemplo de plantilla de email:**
```
Hola {{to_name}},

Tu tutoría con {{docente_name}} está confirmada para el {{fecha}} a las {{hora}}.

Para confirmar tu asistencia, ingresa este código en el sistema:

╔════════════╗
║  {{codigo}}  ║
╚════════════╝

Este código expira el {{expira}}.

Sistema de Tutorías UTN
```

---

## 👤 Cuenta de administrador por defecto

| Email | Contraseña |
|-------|------------|
| admin@utn.edu.mx | Admin2024! |

> ⚠️ **CAMBIA LA CONTRASEÑA** en tu primer inicio de sesión desde la sección Perfil → Seguridad.

---

## 🔄 Flujo de confirmación de tutoría

```
Admin/Docente crea sesión
        ↓
Docente genera código (botón ✉️)
        ↓
Sistema llama API → genera código de 6 chars
        ↓
EmailJS envía email al alumno con el código
        ↓
Alumno abre "Mis Tutorías" → "Ingresar código"
        ↓
Alumno ingresa código → API valida → ✅ Confirmada
        ↓
Docente también confirma asistencia → sesión CONFIRMADA
        ↓
Docente registra avances → sesión COMPLETADA
```

---

## 🔐 Seguridad implementada

- Autenticación con **JWT** (tokens de 8 horas)
- Contraseñas hasheadas con **bcryptjs** (12 rounds)
- **Rate limiting** en API (200 req/15min general, 10 req/15min en login)
- **Helmet** para headers HTTP seguros
- **CORS** restringido al frontend
- Tabla de **auditoría** de todas las acciones del sistema
- Datos separados por rol (alumno solo ve sus sesiones, docente solo las suyas)
- Soft delete (usuarios se desactivan, no se borran)

---

## 📊 Base de datos

```
usuarios ────────────────────────────────────┐
    │                                         │
    ├── asignaciones_tutor (docente↔alumno)   │
    │                                         │
    └── sesiones_tutoria ──────────────────── ┘
              │
              ├── avances_alumno (1:1 con sesión completada)
              └── justificantes (N:1 con sesión)

audit_log (registro global de acciones)
```

---

## 📦 Scripts disponibles

```bash
# Backend
npm run dev      # Modo desarrollo con nodemon
npm start        # Modo producción
npm run migrate  # Ejecutar migraciones

# Frontend  
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
```
