# WeParty monorepo (frontend + backend)

Código base para dos juegos party online en español: **El Impostor** y **Agentes Secretos**. Incluye frontend React + Vite + Tailwind, backend Express + Socket.io, CSV local para palabras y guías de despliegue en Netlify (frontend), Render (backend) y Supabase (datos opcionales).

## Estructura
- `frontend/`: SPA con React Router, Tailwind, cliente Supabase y socket.io-client.
- `backend/`: API REST + Socket.io con lógica de juego en memoria y motores tipados para ambos juegos.
- `backend/data/impostor_words.csv`: palabras y categorías para "El Impostor".

## Flujo rápido
1. **Local**
   - Frontend: `cd frontend && npm install && npm run dev` (http://localhost:5173)
   - Backend: `cd backend && npm install && npm run dev` (http://localhost:4000)
   - Variables: `VITE_API_URL` apunta al backend; `FRONTEND_ORIGIN` en backend debe permitir el origen del frontend.
2. **Salas y juego**
   - Crear sala vía home (elige juego y nick) → lobby por sockets.
   - Host pulsa **Empezar partida** → UI redirige a ruta del juego.
   - "El Impostor": fases `WORD_REVEAL` → `DISCUSSION` → `VOTING` → `RESULT` controladas por eventos.
   - "Agentes Secretos": fases presidencia, votación, legislación y poderes, con condiciones de victoria por políticas o ejecución del líder.

## Qué verificar en Netlify (frontend)
- Configurar en Site settings → Build & deploy:
  - **Build command**: `npm run build`
  - **Publish directory**: `dist`
- Variables de entorno en Site configuration → Environment variables:
  - `VITE_API_URL` = URL pública del backend en Render/Railway.
  - `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` si usas Supabase.
- Fichero `public/_redirects` presente con `/*  /index.html  200` para que React Router funcione.
- Deploy log sin errores de Tailwind/Vite.

## Qué hacer en Render (backend)
- Crear servicio Web apuntando al repo `backend/`.
- En Settings:
  - **Build command**: `npm run build`
  - **Start command**: `npm start`
  - **Environment**: Node 20+.
- Variables de entorno:
  - `PORT` (Render asigna automáticamente, usa `PORT` en env).
  - `FRONTEND_ORIGIN` con el dominio Netlify (y `http://localhost:5173` para pruebas).
  - Claves Supabase si quieres persistencia (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`).
- Comprueba en Logs que el servidor arranca y que `/health` responde `ok`.

## Qué preparar en Supabase
- Proyecto nuevo (free tier) con Postgres.
- (Opcional) Tablas sugeridas: `rooms`, `players`, `topics`, `words` si deseas persistir salas y palabras.
- Copia `Project URL` y `anon/service keys` para el frontend (`anon`) y backend (`service`).

## Más detalles
- Documentación de cada paquete en `frontend/README.md` y `backend/README.md`.
- Lógica de motores:
  - `backend/src/game/impostorEngine.ts`: asignación de impostor, elección de palabra desde CSV, votos y reinicio.
  - `backend/src/game/agentsEngine.ts`: reparto de roles (Leales vs Infiltrados), mazo de políticas, poderes y rotación de presidencia.
- Assets SVG minimalistas en `frontend/src/assets/agents/` (iconos de bandos y líder).
