import Link from "next/link";
import {
  ShieldCheck,
  LockKeyhole,
  KeyRound,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <nav className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white p-2 text-slate-950">
            <LockKeyhole size={20} />
          </div>

          <span className="font-bold">
            MiniVault
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:text-white"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-950">
          <ShieldCheck size={32} />
        </div>

        <h1 className="mx-auto mt-8 max-w-3xl text-5xl font-bold tracking-tight md:text-6xl">
          Your secrets.
          <br />
          Protected.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          MiniVault is a secure password and secrets manager
          designed to keep your sensitive information protected.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-slate-950 hover:bg-slate-200"
          >
            Create Account
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-6 py-3 font-medium hover:bg-slate-900"
          >
            Login
          </Link>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl gap-5 md:grid-cols-3">

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
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-left">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}