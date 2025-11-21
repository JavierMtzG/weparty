interface Props {
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}

export default function GameCard({ title, description, cta, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card w-full text-left p-6 hover:-translate-y-1 hover:border-accent transition grid gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Modo</p>
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
        <span className="button-primary whitespace-nowrap text-sm">{cta}</span>
      </div>
      <p className="text-slate-300 leading-relaxed">{description}</p>
    </button>
  );
}
