# WeParty

Guía rápida para montar la plataforma de minijuegos online (p. ej. "El impostor" y "Agentes Secretos") con frontend en React, backend Node/Express + Socket.io y Supabase para datos y autenticación.

## 1️⃣ Arquitectura general
- **Frontend**: SPA con React + Vite (TypeScript). UI para login/registro, selección de juego, salas, partida y chat. Deploy en Vercel/Netlify.
- **Backend (API + tiempo real)**: Node.js + Express para REST y Socket.io para salas/eventos de juego. Deploy en Railway/Render.
- **Base de datos + Auth**: Supabase (Postgres + Auth). Opción de usar su Realtime, aunque para el juego se recomienda Socket.io.
- **Flujo**: Frontend → Backend (REST + Socket.io) → Supabase (datos/auth) y Socket.io ↔ clientes.

## 2️⃣ Servicios gratuitos recomendados
- **Frontend**: React + Vite + TS. Hosting: Vercel (auto-deploy desde GitHub) o Netlify.
- **Backend**: Node.js + Express + Socket.io. Hosting: Railway o Render (free tier para un servicio Node).
- **Base de datos/Auth**: Supabase (Postgres + Auth, SDK JS, login email/contraseña u OAuth).

## 3️⃣ Flujo con repos y despliegues automáticos
1. **Repos**: `party-games-frontend` y `party-games-backend` (o monorepo, pero mejor separado para empezar).
2. **Frontend → Vercel**: Importar repo desde GitHub; Vercel detecta Vite/React. Cada push a `main` despliega.
3. **Backend → Railway/Render**: Crear servicio desde el repo; configurar env vars (URL/keys de Supabase). Cada push redeploy.
4. **Supabase**: Crear proyecto; tablas para users/rooms/games/words. Usar URL/keys en frontend (auth/lecturas) y backend (lógica/escritura).

## 4️⃣ Estructura básica sugerida
### Frontend (`party-games-frontend`)
```
src/
  main.tsx
  App.tsx
  routes/
    Home.tsx
    Login.tsx
    Lobby.tsx
    GameImpostor.tsx
    GameSecretAgents.tsx
  components/
    Navbar.tsx
    GameCard.tsx
    RoomCodeInput.tsx
    PlayerList.tsx
    Chat.tsx
  services/
    supabaseClient.ts
    api.ts         // llamadas a tu backend
    socket.ts      // conexión Socket.io
```
- **Home**: elegir juego, crear/unirse a sala.
- **Lobby**: jugadores, chat, botón "empezar".
- **GameImpostor / GameSecretAgents**: UI reactiva a eventos de Socket.io.

### Backend (`party-games-backend`)
```
src/
  index.ts
  config/
    env.ts
    supabase.ts
  routes/
    auth.ts
    rooms.ts
    words.ts
  socket/
    index.ts
    impostor.ts
    secretAgents.ts
  models/
    room.ts
    game.ts
    player.ts
  utils/
    validations.ts
```
- `index.ts`: monta Express + Socket.io.
- `socket/impostor.ts`: crea partida, asigna impostor, palabra oculta, gestiona turnos/votos.
- `socket/secretAgents.ts`: roles (leales/traidores), tableros según nº jugadores, turnos y votos.

## 5️⃣ Palabras y temáticas para "El impostor"
Tablas en Supabase:
- **topics**: `id`, `name` (p. ej. "comida", "cine").
- **words**: `id`, `topic_id` (FK), `word` (p. ej. "pizza").

Endpoint de ejemplo: `GET /words/random?topic_id=X` (o sin filtro). Al empezar partida: elegir palabra random, asignar impostor y emitir eventos (todos reciben la palabra salvo el impostor, que recibe solo su rol).

## 6️⃣ Adaptación de "Secret Hitler"
- Renombrar a **"Agentes Secretos"** u otro nombre original; no usar arte/logo oficial.
- Dos bandos: "Leales" vs "Traidores".
- Tableros definidos en JSON según jugadores, p. ej.:
  ```ts
  const boards = {
    5: { loyalPoliciesToWin: 5, traitorPoliciesToWin: 6, specialPowers: [...] },
    6: { ... },
    7: { ... },
  };
  ```
- Seleccionar tablero según nº de jugadores de la sala.

## 7️⃣ Prompts útiles para generar código
- "Genera un proyecto React + Vite + TypeScript con las siguientes rutas y componentes: …"
- "Crea un backend Node + Express + Socket.io con estructura de carpetas: … y un socket manager para el juego del impostor con estos eventos: …"
- "Genera un cliente de Supabase para el frontend con estas tablas: …"

Con esta guía puedes bootstrapear los repos y desplegar con CI/CD minimalista en los tiers gratuitos.
