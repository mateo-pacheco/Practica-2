import { useState } from "react";
import AuthForm from "./components/AuthForm.jsx";
import Chat from "./components/Chat.jsx";

const KEY = "laboratorio-chat";

function readSession() {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY));
    return value?.user?.id && value?.token ? value : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(readSession);

  function signIn(value) {
    sessionStorage.setItem(KEY, JSON.stringify(value));
    setSession(value);
  }

  function signOut() {
    sessionStorage.removeItem(KEY);
    setSession(null);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-8">
      {session ? (
        <>
          <header className="mx-auto mb-4 flex max-w-6xl items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Laboratorio Chat</p>
              <strong>{session.user.name}</strong>
            </div>
            <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm transition hover:bg-slate-50" onClick={signOut}>Cerrar sesión</button>
          </header>
          <Chat session={session} onUnauthorized={signOut} />
        </>
      ) : <AuthForm onSession={signIn} />}
    </main>
  );
}
