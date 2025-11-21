# Backend WeParty (Express + Socket.io + TypeScript)

API REST mínima + sockets para los juegos "El Impostor" y "Agentes Secretos". Estado de partida en memoria y CSV local para palabras.

## Scripts
- `npm install`
- `npm run dev` (nodemon + ts-node)
- `npm run build`
- `npm start`

## Variables de entorno
```
PORT=4000
SUPABASE_URL=<opcional para persistir>
SUPABASE_SERVICE_KEY=<opcional>
FRONTEND_ORIGIN=https://tu-frontend.netlify.app
```

## Endpoints REST
- `GET /health` -> `{status:"ok"}`
- `POST /rooms` body `{ gameType, nickname, userId }`
- `POST /rooms/:code/join` body `{ nickname, userId }`
- `GET /rooms/:code` info de sala
- `GET /topics` lista de temáticas para el impostor

## Eventos Socket.io
- Lobby: `join_room`, `room_update`, `chat_message`, `start_game`, `game_started`.
- Impostor: `join_impostor`, `impostor_ready`, `impostor_to_voting`, `impostor_vote`, `impostor_restart`, `game_state`.
- Agentes Secretos: `join_agents`, `agents_ready`, `agents_choose_chancellor`, `agents_vote`, `agents_president_discard`, `agents_chancellor_discard`, `agents_execute`, `agents_restart`, `game_state`.

## Despliegue en Render
- Build command: `npm run build`
- Start command: `npm start`
- Node version: 20+
- Variables en Render Dashboard: `PORT`, `FRONTEND_ORIGIN` (dominio Netlify), y claves Supabase si las usas.
