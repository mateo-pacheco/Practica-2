export default function MessageComposer({ value, onChange, onSend, enabled, sending = false }) {
  return (
    <form className="flex flex-wrap items-end gap-2 border-t border-slate-100 pt-4" onSubmit={onSend}>
      <label className="grid min-w-0 flex-1 gap-1 text-sm">
        Mensaje
        <input className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" value={value} maxLength={4000} disabled={sending} placeholder="Escribe un mensaje…" onChange={(event) => onChange(event.target.value)} />
      </label>
      <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={!enabled || sending || !value.trim()}>
        {sending ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}
