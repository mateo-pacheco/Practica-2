import { useState } from "react";
import { api } from "../services/api.js";

export default function AuthForm({ onSession }) {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (busy) return;

    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError("");
    try {
      const path = register ? "/auth/register" : "/auth/login";
      onSession(await api(path, { method: "POST", body: data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function toggleMode() {
    setRegister((current) => !current);
    setError("");
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">Laboratorio Chat</p>
        <h1 className="text-2xl font-bold">{register ? "Crear cuenta" : "Iniciar sesión"}</h1>
        <p className="mt-1 text-sm text-slate-600">Mensajería en tiempo real con historial persistente.</p>
      </div>

      <form className="grid gap-3" onSubmit={submit}>
        {register && (
          <label className="grid gap-1 text-sm font-medium">
            Nombre
            <input className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" name="name" required minLength={2} autoComplete="name" />
          </label>
        )}
        <label className="grid gap-1 text-sm font-medium">
          Correo
          <input className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" name="email" type="email" required autoComplete="email" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Contraseña
          <input className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" name="password" type="password" required minLength={8} autoComplete={register ? "new-password" : "current-password"} />
        </label>
        <button className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy}>
          {busy ? "Enviando…" : "Continuar"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
      <button className="mt-4 text-sm font-medium text-indigo-700 hover:text-indigo-900" type="button" disabled={busy} onClick={toggleMode}>
        {register ? "Ya tengo cuenta" : "Crear una cuenta"}
      </button>
    </section>
  );
}
