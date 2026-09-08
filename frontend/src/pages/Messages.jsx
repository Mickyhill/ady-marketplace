import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatNaira } from "../components/ListingCard";

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getConversations().then((d) => {
      setConversations(d.conversations);
      if (d.conversations[0]) setActive(d.conversations[0]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!active) return;
    api.getThread(active.listing.id, active.otherUser.id).then((d) => setThread(d.messages));
  }, [active]);

  async function handleReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    await api.sendMessage({ listingId: active.listing.id, content: reply, receiverId: active.otherUser.id });
    setReply("");
    const d = await api.getThread(active.listing.id, active.otherUser.id);
    setThread(d.messages);
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm text-ink-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Messages</h1>
      {conversations.length === 0 ? (
        <p className="text-sm text-ink-500">No conversations yet. Message a seller from a listing to start one.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 border border-ink-300/40 rounded-lg overflow-hidden bg-white" style={{ minHeight: 420 }}>
          <div className="border-r border-ink-300/40">
            {conversations.map((c) => (
              <button
                key={`${c.listing.id}-${c.otherUser.id}`}
                onClick={() => setActive(c)}
                className={`w-full text-left px-4 py-3 border-b border-ink-300/30 hover:bg-ink-100 ${active?.otherUser.id === c.otherUser.id && active?.listing.id === c.listing.id ? "bg-ink-100" : ""}`}
              >
                <p className="text-sm font-medium truncate">{c.otherUser.name}</p>
                <p className="text-xs text-ink-500 truncate">{c.listing.title} · {formatNaira(c.listing.price)}</p>
                <p className="text-xs text-ink-500 truncate mt-1">{c.lastMessage}</p>
              </button>
            ))}
          </div>

          <div className="md:col-span-2 flex flex-col">
            {active && (
              <>
                <div className="px-4 py-3 border-b border-ink-300/40 text-sm">
                  <span className="font-medium">{active.otherUser.name}</span>
                  <span className="text-ink-500"> — about "{active.listing.title}"</span>
                </div>
                <div className="flex-1 p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 320 }}>
                  {thread.map((m) => (
                    <div key={m.id} className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${m.senderId === user.id ? "ml-auto bg-brand-500 text-white" : "bg-ink-100"}`}>
                      {m.content}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleReply} className="p-3 border-t border-ink-300/40 flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-ink-300/50 rounded-full px-4 py-2 text-sm"
                  />
                  <button className="bg-brand-500 hover:bg-brand-600 text-white rounded-full px-4 py-2 text-sm">Send</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
