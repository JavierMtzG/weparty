import { FormEvent, useState } from 'react';

interface Message {
  author: string;
  content: string;
}

interface Props {
  messages?: Message[];
  onSend?: (message: string) => void;
}

export default function Chat({ messages = [], onSend }: Props) {
  const [text, setText] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    onSend?.(text.trim());
    setText('');
  };

  return (
    <div className="card p-4 h-full grid grid-rows-[1fr_auto] gap-3">
      <div className="space-y-2 overflow-y-auto pr-1 max-h-64">
        {messages.length === 0 && <p className="text-slate-500 text-sm">Sin mensajes aún.</p>}
        {messages.map((message, index) => (
          <div key={index} className="bg-slate-900/70 px-3 py-2 rounded-lg text-sm">
            <p className="text-slate-400 text-xs mb-0.5">{message.author}</p>
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-500"
          placeholder="Enviar mensaje"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="button-primary">
          Enviar
        </button>
      </form>
    </div>
  );
}
