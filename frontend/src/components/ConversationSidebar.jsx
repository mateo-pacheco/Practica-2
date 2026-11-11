export default function ConversationSidebar({
  users,
  conversations,
  selected,
  member,
  onMemberChange,
  onRefresh,
  onCreate,
  onSelect,
  creating,
  blocked = false,
}) {
  return (
    <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Conversaciones</h2>
        <button className="text-xs font-medium text-indigo-700 hover:text-indigo-900" type="button" onClick={onRefresh}>
          Actualizar
        </button>
      </div>

      <form className="my-4 grid gap-2 border-b border-slate-100 pb-4" onSubmit={onCreate}>
        <label className="grid gap-1 text-sm">
          Nuevo chat con
          <select className="w-full rounded-lg border border-slate-300 bg-white p-2" value={member} onChange={(event) => onMemberChange(event.target.value)} required>
            <option value="">Selecciona un usuario</option>
            {users.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </label>
        <button className="rounded-lg bg-indigo-600 p-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={creating || blocked || !member}>
          {creating ? "Creando…" : "Crear conversación"}
        </button>
      </form>

      <nav className="grid gap-2" aria-label="Conversaciones">
        {conversations.length === 0 && <p className="text-sm text-slate-500">Aún no tienes conversaciones.</p>}
        {conversations.map((chat) => (
          <button key={chat.id} type="button" aria-pressed={selected === chat.id} disabled={blocked} onClick={() => onSelect(chat.id)} className="break-words rounded-lg border border-slate-200 p-2 text-left text-sm transition hover:border-indigo-300 hover:bg-indigo-50 aria-pressed:border-indigo-300 aria-pressed:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50">
            {chat.title || "Conversación sin título"}
          </button>
        ))}
      </nav>
    </aside>
  );
}
