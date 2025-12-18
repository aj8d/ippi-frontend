import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <>
      {/* <div class="mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
        <img class="size-12 shrink-0" src="" alt="ChitChat Logo" />
        <div>
          <div class="text-xl font-medium text-black dark:text-white">ChitChat</div>
          <p class="text-gray-500 dark:text-gray-400">You have a new message!</p>
        </div>
      </div>
       */}

      <nav className="mx-auto max-w-sm flex place-items-stretch gap-8 rounded-xl bg-white p-6 shadow-lg">
        <Link to="/home" className="text-gray-500">
          Home
        </Link>
        <Link to="/about" className="text-gray-500">
          About
        </Link>
        <Link to="/blog" className="text-gray-500">
          Blog
        </Link>
        <Link to="/" className="text-gray-500">
          Try
        </Link>
      </nav>
    </>
  );
}
