# Municipalidad de Trancas — Frontend

Frontend React + Vite del portal municipal.

## Requisitos

- Node.js 20+
- Backend API levantado (carpeta `../backend`)

## Configuración

1. Instalá dependencias:

   ```bash
   npm install
   ```

2. Creá el archivo `.env` en la raíz del frontend.

3. Definí `VITE_API_URL` con la URL base del backend (sin barra final).

4. Reiniciá Vite cada vez que cambies `.env`.

## Desarrollo

```bash
npm run dev
```

## Build de producción

```bash
npm run build
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del backend (`http://127.0.0.1:4000` en local) |

## Integración con backend

- Noticias públicas: `GET /api/news`, `GET /api/news/:idOrSlug`
- Admin: login JWT en `/api/auth/login`
- Imágenes de noticias:
  - subida por archivo: `POST /api/upload`
  - importación por URL: `POST /api/upload/from-url`

## Notas

- En producción las imágenes se sirven desde URLs absolutas devueltas por la API (Cloudinary).
