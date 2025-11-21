interface Props {
  message?: string;
}

export default function LoadingScreen({ message = 'Cargando...' }: Props) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <div className="h-16 w-16 border-4 border-accent/40 border-t-accent rounded-full animate-spin" />
      <p className="text-lg text-slate-200 font-semibold">{message}</p>
    </div>
  );
}
