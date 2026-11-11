import { useEffect, useRef, useState } from "react";
import {
  Bot,
  LoaderCircle,
  Minus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useBoardAssistant } from "../hooks/useBoardAssistant";

const suggestions = [
  "Summarize my board.",
  "Show all sections.",
  "List all issues.",
  "Find incomplete work.",
  "Search for bugs.",
  "Analyze my project progress.",
  "Which section has the most issues?",
  "Give me suggestions to improve this board.",
];

export const BoardAssistant = ({ boardId, boardTitle }) => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const {
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
  } = useBoardAssistant(boardId);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open, minimized]);

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setMinimized(false);
        }}
        className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-xl shadow-black/30 transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#0B1220]"
        aria-label="Open AI Board Assistant"
      >
        <Sparkles className="h-5 w-5" />
        <span>Ask AI</span>
      </button>
    );
  }

  return (
    <section
      className="fixed bottom-4 right-4 z-40 flex w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-navy-border bg-navy-bg shadow-2xl shadow-black/50 sm:bottom-6 sm:right-6"
      style={{ height: minimized ? "auto" : "min(680px, calc(100dvh - 2rem))" }}
      aria-label="AI Board Assistant"
    >
      <header className="flex items-center justify-between border-b border-navy-border bg-navy-card px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-text-main">
              AI Board Assistant
            </h2>
            <p className="truncate text-xs text-text-secondary">
              {boardTitle || "Current board"}
            </p>
          </div>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setMinimized((current) => !current)}
            className="rounded-lg p-2 text-text-secondary transition hover:bg-navy-elevated hover:text-text-main"
            aria-label={minimized ? "Expand assistant" : "Minimize assistant"}
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-text-secondary transition hover:bg-navy-elevated hover:text-text-main"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {!minimized && (
        <>
          <div
            className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="rounded-2xl rounded-tl-sm border border-navy-border bg-navy-card px-4 py-3 text-sm leading-relaxed text-text-main">
                  Ask me about this board. I can read board details, sections,
                  issues, and comments.
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Quick prompts
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        disabled={loading}
                        onClick={() => sendMessage(suggestion)}
                        className="rounded-full border border-navy-border bg-navy-card px-3 py-2 text-left text-xs text-text-secondary transition hover:border-primary/60 hover:text-text-main disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-sm bg-primary text-white"
                      : "rounded-bl-sm border border-navy-border bg-navy-card text-text-main"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-navy-border bg-navy-card px-4 py-3 text-sm text-text-secondary">
                  <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                  Thinking...
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border-t border-navy-border bg-navy-card p-3"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Ask about this board..."
              rows={1}
              maxLength={4000}
              disabled={!boardId}
              className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-navy-border bg-navy-bg px-3 py-3 text-sm text-text-main outline-none transition placeholder:text-text-muted focus:border-primary disabled:opacity-60"
              aria-label="Message to AI Board Assistant"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !boardId}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
              title="Send message"
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
          <p className="bg-navy-card px-4 pb-3 text-[10px] text-text-muted">
            Read-only assistant · Enter to send · Shift + Enter for a new line
          </p>
        </>
      )}
    </section>
  );
};

export default BoardAssistant;
