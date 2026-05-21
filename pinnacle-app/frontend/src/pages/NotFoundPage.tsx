import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-500">404 · No build found</div>
        <h1 className="font-display text-6xl tracking-wide mt-2">Off the line.</h1>
        <p className="mt-3 text-graphite-600">That route isn't on the assembly plan.</p>
        <Link to="/" className="mt-6 inline-flex px-4 py-2.5 bg-racing-600 text-white font-display tracking-wider text-sm uppercase">
          Return to console
        </Link>
      </div>
    </div>
  );
}
