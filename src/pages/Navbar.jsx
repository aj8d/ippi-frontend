import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();

  return (
    <>
      <nav className="mx-auto max-w-sm flex place-items-stretch justify-center gap-8 rounded-xl bg-white p-6 shadow-lg m-2">
        <Link
          to="/home"
          className={location.pathname === '/home' ? 'text-sky-500 py-2' : 'text-gray-500 py-2'}
        >
          Home
        </Link>
        <Link
          to="/about"
          className={location.pathname === '/about' ? 'text-sky-500 py-2' : 'text-gray-500 py-2'}
        >
          About
        </Link>
        <Link
          to="/blog"
          className={location.pathname === '/blog' ? 'text-sky-500 py-2' : 'text-gray-500 py-2'}
        >
          Blog
        </Link>
        <Link
          to="/"
          className="text-slate-50 bg-sky-500 rounded-xl px-4 py-2 flex flex-row gap-2 items-center"
        >
          Try
          <ArrowRight strokeWidth={2} size={18} />
        </Link>
      </nav>
    </>
  );
}
