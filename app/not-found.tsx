import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="container-wide max-w-lg text-center py-20">
        <div className="font-heading font-bold text-8xl gradient-text mb-4">
          404
        </div>
        <h1 className="font-heading text-2xl font-bold text-ink mb-3">
          Page Not Found
        </h1>
        <p className="text-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/holiday-packages"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 border-2 border-border text-ink font-semibold rounded-xl hover:border-primary hover:text-primary transition-all"
          >
            <Search className="w-4 h-4" />
            Browse Packages
          </Link>
        </div>
      </div>
    </div>
  );
}
