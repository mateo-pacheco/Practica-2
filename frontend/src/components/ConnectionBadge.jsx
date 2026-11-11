export default function ConnectionBadge({ connected }) {
  return (
    <p role="status" className={connected ? "mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800" : "mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900"}>
      {connected ? "Chat conectado" : "Chat desconectado"}
    </p>
  );
}
