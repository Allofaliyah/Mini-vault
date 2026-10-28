
import Link from "next/link";
import {
  ShieldCheck,
  LockKeyhole,
  KeyRound,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="rounded-lg bg-white p-2 text-slate-950">
            <LockKeyhole size={20} />
          </div>

          <span className="text-lg font-bold sm:text-xl">
            MiniVault
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:text-white sm:px-4"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="whitespace-nowrap rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-slate-200 sm:px-4 sm:text-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20 md:py-24">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950 sm:h-16 sm:w-16">
          <ShieldCheck size={30} className="sm:hidden" />
          <ShieldCheck size={34} className="hidden sm:block" />
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:mt-8 sm:text-5xl md:text-6xl">
          Your secrets.
          <br />
          Protected.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl px-1 text-base leading-7 text-slate-400 sm:mt-6 sm:text-lg">
          MiniVault is a secure password and secrets manager
          designed to keep your sensitive information protected.
        </p>

        {/* Action Buttons */}
        <div className="mx-auto mt-7 flex w-full max-w-md flex-col justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
          <Link
            href="/register"
            className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-slate-950 transition hover:bg-slate-200"
          >
            Create Account
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/login"
            className="flex min-h-12 items-center justify-center rounded-lg border border-slate-700 px-6 py-3 font-medium transition hover:bg-slate-900"
          >
            Login
          </Link>
        </div>

        {/* Features */}
        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 text-left sm:mt-16 sm:grid-cols-2 sm:gap-5 md:mt-20 md:grid-cols-3">
          <Feature
            icon={<LockKeyhole size={22} />}
            title="Encrypted Vault"
            description="Protect your secrets with strong encryption."
          />

          <Feature
            icon={<KeyRound size={22} />}
            title="MFA Protection"
            description="Add another layer of protection to your account."
          />

          <Feature
            icon={<ShieldCheck size={22} />}
            title="Security First"
            description="Built around authentication and least privilege."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="h-full rounded-xl border border-slate-800 bg-slate-900 p-5 transition duration-200 hover:border-slate-600 sm:p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
        {icon}
      </div>

      <h3 className="mt-4 text-base font-semibold sm:mt-5">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}
