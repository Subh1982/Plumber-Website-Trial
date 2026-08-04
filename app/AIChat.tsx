"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "user" | "model";
  text: string;
};

const welcomeMessage: Message = {
  id: 0,
  role: "model",
  text: "Hi! I’m the Hornsby Star assistant. Ask me about our plumbing services, indicative prices or service area.",
};

const suggestions = [
  "How much is a blocked drain?",
  "Do you service my suburb?",
  "What does the 5% discount cover?",
];

export function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, busy]);

  async function sendMessage(text: string) {
    const message = text.trim();
    if (!message || busy) return;

    const history = messages
      .filter((item) => item.id !== welcomeMessage.id)
      .slice(-6)
      .map(({ role, text: historyText }) => ({
        role,
        text: historyText.slice(0, role === "model" ? 2_000 : 1_000),
      }));

    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: "user", text: message },
    ]);
    setInput("");
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      const result: unknown = await response.json();
      const answer =
        isRecord(result) && typeof result.answer === "string"
          ? result.answer
          : isRecord(result) && typeof result.error === "string"
            ? result.error
            : "Chat is temporarily unavailable. Please call 02 9158 7742.";

      setMessages((current) => [
        ...current,
        { id: nextId.current++, role: "model", text: answer },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "model",
          text: "Chat is temporarily unavailable. Please call 02 9158 7742.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") setOpen(false);
  }

  function clearConversation() {
    setMessages([welcomeMessage]);
    setInput("");
    inputRef.current?.focus();
  }

  return (
    <aside className="ai-chat" onKeyDown={handlePanelKeyDown}>
      {open && (
        <section
          className="ai-chat-panel"
          role="dialog"
          aria-label="Hornsby Star plumbing assistant"
        >
          <header className="ai-chat-header">
            <div>
              <span className="ai-chat-status" aria-hidden="true" />
              <strong>Hornsby Star Assistant</strong>
              <small>AI assistant · Prices and bookings need confirmation</small>
            </div>
            <button
              type="button"
              className="ai-chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div
            className="ai-chat-messages"
            ref={messagesRef}
            aria-live="polite"
            aria-busy={busy}
          >
            {messages.map((message) => (
              <div
                className={`ai-message ai-message-${message.role}`}
                key={message.id}
              >
                <span>{message.role === "model" ? "★" : "You"}</span>
                <p>{message.text}</p>
              </div>
            ))}
            {busy && (
              <div className="ai-message ai-message-model ai-message-loading">
                <span>★</span>
                <p><i /><i /><i /><span className="sr-only">Thinking</span></p>
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="ai-chat-suggestions" aria-label="Suggested questions">
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  onClick={() => void sendMessage(suggestion)}
                  key={suggestion}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form className="ai-chat-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="ai-chat-message">Your plumbing question</label>
            <input
              id="ai-chat-message"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={1_000}
              disabled={busy}
              placeholder="Ask a plumbing question…"
              autoComplete="off"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send message">
              →
            </button>
          </form>

          <footer className="ai-chat-footer">
            <button type="button" onClick={clearConversation} disabled={busy}>Clear chat</button>
            <span>Don’t share passwords or payment details.</span>
          </footer>
        </section>
      )}

      <button
        className="ai-chat-toggle"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close plumbing assistant" : "Open plumbing assistant"}
      >
        <span className="ai-chat-toggle-icon" aria-hidden="true">★</span>
        <span><b>Ask our assistant</b><small>Services, prices &amp; more</small></span>
      </button>
    </aside>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
