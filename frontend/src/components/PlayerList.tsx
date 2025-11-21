interface PlayerListItem {
  id: string;
  nickname: string;
  isHost?: boolean;
  isYou?: boolean;
  isAlive?: boolean;
}

interface Props {
  players: PlayerListItem[];
  title?: string;
}

export default function PlayerList({ players, title = 'Jugadores' }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm uppercase tracking-[0.2em] text-slate-400">{title}</h4>
        <span className="text-xs text-slate-500">{players.length} conectados</span>
      </div>
      <ul className="grid gap-2">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-loyal font-semibold text-slate-950">
                {player.nickname.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold text-white">{player.nickname}</p>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  {player.isHost ? 'Host' : 'Jugador'}
                  {player.isYou ? ' · Tú' : ''}
                  {player.isAlive === false ? ' · Expulsado' : ''}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
