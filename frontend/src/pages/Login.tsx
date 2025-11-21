import { FormEvent, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : 'Sesión iniciada, listo para jugar.');
  };

  return (
    <div className="max-w-md mx-auto card p-6 grid gap-4">
      <h1 className="text-2xl font-bold">Entrar</h1>
      <form onSubmit={handleSubmit} className="grid gap-3">
        <input
          className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-slate-100"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <input
          className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-slate-100"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        <button className="button-primary" type="submit">
          Entrar
        </button>
      </form>
      {message && <p className="text-sm text-slate-300">{message}</p>}
    </div>
  );
}
