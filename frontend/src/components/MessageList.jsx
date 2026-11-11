function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default function MessageList({ messages, userId, loading }) {
  return (
    <>
      {loading && <p className="text-sm text-slate-600" role="status">Cargando historial…</p>}
      {!loading && messages.length === 0 && <p className="my-3 text-sm text-slate-600">Todavía no hay mensajes.</p>}
      <ol className="my-3 flex max-h-[28rem] min-h-24 flex-col gap-2 overflow-y-auto pr-1" aria-label="Historial de mensajes">
        {messages.map((message) => {
          const ownMessage = message.senderId === userId;
          return (
            <li key={message.id} className={ownMessage ? "max-w-[85%] self-end break-words rounded-xl bg-indigo-100 p-3" : "max-w-[85%] self-start break-words rounded-xl bg-slate-100 p-3"}>
              <div className="flex items-baseline justify-between gap-3">
                <strong className="text-sm">{ownMessage ? "Tú" : message.sender?.name || "Usuario"}</strong>
                <time className="text-[11px] text-slate-500" dateTime={message.createdAt}>{formatDate(message.createdAt)}</time>
              </div>
              <p className="mt-1 whitespace-pre-wrap">{message.content}</p>
            </li>
          );
        })}
      </ol>
    </>
  );
}
