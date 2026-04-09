import React, { useState, useRef, useEffect } from "react";
import "./ChatBubble.css";

const API = process.env.REACT_APP_API_URL || "https://outfit-ai-9snk.onrender.com";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
  { role: "assistant", content: "Hey there! 👋 I'm your personal Outfit AI stylist ✨\n\nTell me about your day, the occasion, or just ask — and I'll put together the perfect look from your wardrobe! 👗🌤️" }
]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      // Optionally pass weather from localStorage if you cache it
      const weather = JSON.parse(localStorage.getItem("weather") || "null");

      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: newMessages, weather }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-bubble-wrapper">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
  <span>👗 Outfit Stylist</span>
  <div style={{ display: 'flex', gap: '8px' }}>
    <button onClick={() => {
  if (window.confirm("Start a new chat? This will clear the current conversation.")) {
    setMessages([{ role: "assistant", content: "Hey there! 👋 I'm your personal Outfit AI stylist ✨\n\nTell me about your day, the occasion, or just ask — and I'll put together the perfect look from your wardrobe! 👗🌤️" }]);
  }
}} title="New Chat">🔄</button>
    <button onClick={() => setOpen(false)}>✕</button>
  </div>
</div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && (
  <div className="chat-msg assistant typing">
    Styling your look
    <div className="dot-flashing">
      <span /><span /><span />
    </div>
  </div>
)}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input-row">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your outfit..."
              rows={1}
            />
            <button onClick={sendMessage} disabled={loading}>Send</button>
          </div>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen(!open)}>
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}