import loyalIcon from '../../assets/agents/loyal.svg';
import infiltratedIcon from '../../assets/agents/infiltrated.svg';
import leaderIcon from '../../assets/agents/leader.svg';
import avatarToken from '../../assets/agents/avatar.svg';
import loyalTrack from '../../assets/agents/board_loyal.svg';
import infiltratedTrack from '../../assets/agents/board_infiltrated.svg';
import table from '../../assets/agents/table.svg';

export function FactionIcon({ type, size = 56 }: { type: 'LEAL' | 'INFILTRADO' | 'LIDER'; size?: number }) {
  const source = type === 'LEAL' ? loyalIcon : type === 'INFILTRADO' ? infiltratedIcon : leaderIcon;
  return <img src={source} width={size} height={size} alt={type} />;
}

export function AvatarToken({ nickname }: { nickname: string }) {
  return (
    <div className="relative inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-2 text-white">
      <img src={avatarToken} alt="avatar" className="h-10 w-10" />
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Jugador</p>
        <p className="font-semibold">{nickname}</p>
      </div>
    </div>
  );
}

export function LoyalTrack({ progress }: { progress: number }) {
  return (
    <div className="relative w-full max-w-2xl">
      <img src={loyalTrack} alt="Pista leal" className="w-full" />
      <div className="absolute inset-0 flex items-center gap-4 px-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
              index < progress ? 'bg-loyal/90 text-slate-900 border-loyal' : 'bg-slate-900/60 border-slate-700 text-slate-400'
            }`}
          >
            {index + 1}
          </span>
        ))}
      </div>
    </div>
  );
}

export function InfiltratedTrack({ progress }: { progress: number }) {
  const powerLabels = ['—', '—', 'Investigar', 'Ejecutar', 'Ejecutar', 'Victoria'];
  return (
    <div className="relative w-full max-w-2xl">
      <img src={infiltratedTrack} alt="Pista infiltrada" className="w-full" />
      <div className="absolute inset-0 flex items-center gap-4 px-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="relative flex flex-col items-center gap-1">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                index < progress ? 'bg-red-500 text-slate-900 border-red-200' : 'bg-slate-900/60 border-slate-700 text-slate-400'
              }`}
            >
              {index + 1}
            </span>
            <p className="text-[11px] text-center text-slate-400 leading-tight w-16">{powerLabels[index]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableBackground() {
  return <img src={table} alt="Mesa" className="w-full rounded-3xl border border-slate-800/60" />;
}
