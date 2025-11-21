import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/login', label: 'Entrar' },
  { href: '/register', label: 'Registro' },
];

export default function Navbar() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/70 border-b border-slate-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="font-black tracking-tight text-xl text-accent">
          WeParty
        </Link>
        <nav className="flex gap-4 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-1 rounded-lg transition ${
                location.pathname === link.href ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
