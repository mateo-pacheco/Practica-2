import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api.js";
import { useChatSocket } from "../hooks/useChatSocket.js";
import ConnectionBadge from "./ConnectionBadge.jsx";
import ConversationSidebar from "./ConversationSidebar.jsx";
import MessageList from "./MessageList.jsx";
import MessageComposer from "./MessageComposer.jsx";

function mergeMessages(previous, incoming) {
  const byId = new Map(previous.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id));
}

function unwrapList(data, key) {
  return Array.isArray(data) ? data : data?.[key] || [];
}

export default function Chat({ session, onUnauthorized }) {
  const { user, token } = session;
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState("");
  const [member, setMember] = useState("");
  const [byConversation, setByConversation] = useState({});
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const addMessages = useCallback((id, messages) => {
    setByConversation((previous) => ({
      ...previous,
      [id]: mergeMessages(previous[id] || [], messages),
    }));
  }, []);

  const receiveMessage = useCallback((message) => {
    addMessages(message.conversationId, [message]);
  }, [addMessages]);

  const { connected, connectionError, connectionCount, send } = useChatSocket(token, receiveMessage);

  const report = useCallback((err) => {
    if (err.name === "AbortError") return;
    if (err.status === 401) onUnauthorized();
    else setError(err.message);
  }, [onUnauthorized]);

  const refreshLists = useCallback(async (signal) => {
    try {
      const [peopleData, conversationsData] = await Promise.all([
        api("/users", { token, signal }),
        api("/conversations", { token, signal }),
      ]);
      if (signal?.aborted) return;
      setUsers(unwrapList(peopleData, "users"));
      setConversations(unwrapList(conversationsData, "conversations"));
    } catch (err) {
      if (!signal?.aborted) report(err);
    }
  }, [report, token]);

  useEffect(() => {
    const controller = new AbortController();
    refreshLists(controller.signal);
    return () => controller.abort();
  }, [refreshLists]);

  useEffect(() => {
    if (!selected) return undefined;
    const controller = new AbortController();
    setLoading(true);
    api(`/conversations/${selected}/messages?limit=30`, { token, signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) addMessages(selected, data.messages || []);
      })
      .catch((err) => {
        if (!controller.signal.aborted) report(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, selected, addMessages, connectionCount, report]);

  async function create(event) {
    event.preventDefault();
    if (!member || creating || sending) return;
    setCreating(true);
    setError("");
    try {
      const person = users.find((item) => item.id === member);
      const data = await api("/conversations", {
        method: "POST",
        token,
        body: { title: `${user.name} y ${person?.name || "participante"}`, memberIds: [member] },
      });
      const chat = data.conversation || data;
      await refreshLists();
      setSelected(chat.id);
      setDraft("");
      setMember("");
    } catch (err) {
      report(err);
    } finally {
      setCreating(false);
    }
  }

  function selectConversation(id) {
    setSelected(id);
    setDraft("");
    setError("");
  }

  async function sendMessage(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!selected || !content || !connected || sending || creating) return;

    setSending(true);
    setError("");
    try {
      const saved = await send(selected, content);
      addMessages(saved.conversationId, [saved]);
      setDraft("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  const selectedConversation = conversations.find((chat) => chat.id === selected);

  return (
    <div className="mx-auto max-w-6xl">
      <ConnectionBadge connected={connected} />
      {connectionError && <p className="mb-3 text-sm text-red-700" role="alert">Socket.IO: {connectionError}</p>}
      {error && <p className="mb-3 text-sm text-red-700" role="alert">{error}</p>}

      <div className="grid gap-4 md:grid-cols-[16rem_minmax(0,1fr)]">
        <ConversationSidebar
          users={users}
          conversations={conversations}
          selected={selected}
          member={member}
          onMemberChange={setMember}
          creating={creating}
          blocked={sending}
          onRefresh={() => refreshLists()}
          onCreate={create}
          onSelect={selectConversation}
        />
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">{selectedConversation?.title || "Chat"}</h2>
          {!selected ? (
            <p className="mt-3 text-slate-600">Selecciona una conversación para comenzar.</p>
          ) : (
            <>
              <MessageList messages={byConversation[selected] || []} userId={user.id} loading={loading} />
              <MessageComposer value={draft} onChange={setDraft} onSend={sendMessage} enabled={connected && !creating} sending={sending} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
