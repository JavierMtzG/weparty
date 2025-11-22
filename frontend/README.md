# Frontend WeParty (React + Vite + Tailwind)

UI responsive en español para "El Impostor" y "Agentes Secretos". Incluye rutas públicas, lobby, pantallas de juego y assets SVG minimalistas.

## Scripts
- `npm install`
- `npm run dev` (local en `http://localhost:5173`)
- `npm run build`
- `npm run preview`

## Variables de entorno
Crea `.env` en la raíz de `frontend/`:
```
VITE_SUPABASE_URL=<tu-url>
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_API_URL=http://localhost:4000
```

## Despliegue en Vercel
- Root directory: `frontend` (monorepo con backend aparte).
- Framework preset: Vite.
- Build command: `npm run build` (Vercel ejecuta `npm install` automáticamente).
- Output directory: `dist`.
- Fallback SPA: `vercel.json` en la raíz ya incluye la ruta comodín `/(.*) -> /index.html` para React Router.
- Configura variables en Vercel UI: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` apuntando al backend desplegado.

## Rutas
- `/` home con selección de juego, creación y unión a sala.
- `/login`, `/register` (auth Supabase opcional).
- `/lobby/:roomCode` lobby por socket.
- `/game/impostor/:roomCode` y `/game/agents/:roomCode` para las UIs de partida.

## Diseño
Tailwind con paleta oscura, tarjetas y botones reutilizables. Assets en `src/assets/agents/*` para iconos de bandos y roles.
