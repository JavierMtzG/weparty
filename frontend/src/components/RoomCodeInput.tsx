interface Props {
  onSubmit: (code: string) => void;
  placeholder?: string;
}

export default function RoomCodeInput({ onSubmit, placeholder = 'Código de sala' }: Props) {
  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const input = form.elements.namedItem('roomCode') as HTMLInputElement;
        if (input.value.trim()) {
          onSubmit(input.value.trim());
        }
      }}
    >
      <input
        name="roomCode"
        className="flex-1 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder:text-slate-500"
        placeholder={placeholder}
      />
      <button type="submit" className="button-primary">
        Unirse
      </button>
    </form>
  );
}
