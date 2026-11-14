import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Bot,
  Clock3,
  GitBranch,
  Layers,
  LayoutDashboard,
  Lightbulb,
  LoaderCircle,
  MessageSquare,
  MessagesSquare,
  Minus,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AIActionsPanel from "./AIActionsPanel";
import { useBoardAssistant } from "../hooks/useBoardAssistant";

const promptCategories = [
  {
    title: "Board overview",
    icon: LayoutDashboard,
    prompts: [
      { text: "Give me a complete overview of this board.", icon: LayoutDashboard },
      { text: "Which sections contain the most issues?", icon: Layers },
    ],
  },
  {
    title: "Task management",
    icon: Search,
    prompts: [
      { text: "Find issues with no description.", icon: Search },
      { text: "Show recently created or updated issues.", icon: Clock3 },
    ],
  },
  {
    title: "Project analysis",
    icon: Lightbulb,
    prompts: [
      {
        text: "Identify possible blockers from issue titles and descriptions.",
        icon: GitBranch,
      },
      { text: "Summarize common themes across the issues.", icon: Lightbulb },
    ],
  },
  {
    title: "Team collaboration",
    icon: MessageSquare,
    prompts: [
      { text: "Show recent comments and discussions.", icon: MessageSquare },
      {
        text: "Which issues have generated the most discussion?",
        icon: MessagesSquare,
      },
    ],
  },
];

export const BoardAssistant = ({ boardId, boardTitle }) => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [actionsRefreshTrigger, setActionsRefreshTrigger] = useState(0);
  const handleProposalCreated = useCallback(() => {
    setActionsRefreshTrigger((current) => current + 1);
  }, []);
  const {
    messages,
    input,
    setInput,
    loading,
    historyLoading,
    historyLoaded,
    historyError,
    error,
    failedMessage,
    loadHistory,
    sendMessage,
    retryHistory,
    retryMessage,
  } = useBoardAssistant(boardId, handleProposalCreated);
  const chatScrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const shouldFollowMessagesRef = useRef(true);
  const previousChatActiveRef = useRef(false);
  const previousHistoryLoadedRef = useRef(false);
  const assistantVisible = open && !minimized;
  const launcherVisible = !open || minimized;

  const scrollToLatest = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useLayoutEffect(() => {
    const chatActive = assistantVisible && activeTab === "chat";
    const switchedToChat = chatActive && !previousChatActiveRef.current;
    const historyJustLoaded =
      chatActive && historyLoaded && !previousHistoryLoadedRef.current;

    previousChatActiveRef.current = chatActive;
    previousHistoryLoadedRef.current = historyLoaded;
    if (!chatActive || (!switchedToChat && !historyJustLoaded)) return;

    shouldFollowMessagesRef.current = true;
    if (!historyLoaded || !messages.length) {
      chatScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    } else {
      scrollToLatest("auto");
    }
  }, [activeTab, assistantVisible, historyLoaded, messages.length, scrollToLatest]);

  useEffect(() => {
    if (
      assistantVisible &&
      activeTab === "chat" &&
      messages.length > 0 &&
      shouldFollowMessagesRef.current
    ) {
      scrollToLatest();
    }
  }, [messages, assistantVisible, activeTab, scrollToLatest]);

  const sendChatMessage = (message) => {
    shouldFollowMessagesRef.current = true;
    sendMessage(message);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendChatMessage();
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  };

  return (
    <>
      {hasOpened && (
        <section
          className={`fixed bottom-4 right-4 z-40 flex h-[calc(100dvh-2rem)] max-h-[680px] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-navy-border bg-navy-bg shadow-2xl shadow-black/50 transition-[opacity,transform] duration-200 ease-out sm:bottom-6 sm:right-6 ${
            assistantVisible
              ? "pointer-events-auto scale-100 opacity-100"
              : "pointer-events-none scale-[0.97] opacity-0"
          }`}
          aria-label="AI Board Assistant"
          aria-hidden={!assistantVisible}
          inert={!assistantVisible}
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
            onClick={() => setMinimized(true)}
            className="rounded-lg p-2 text-text-secondary transition hover:bg-navy-elevated hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={minimized ? "Expand assistant" : "Minimize assistant"}
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-text-secondary transition hover:bg-navy-elevated hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

        <>
          <div className="flex border-b border-navy-border bg-navy-card px-2 pb-0 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              aria-pressed={activeTab === "chat"}
              className={`flex-1 rounded-t-xl px-3 py-2 text-xs font-semibold transition ${
                activeTab === "chat"
                  ? "bg-navy-bg text-text-main"
                  : "text-text-secondary hover:text-text-main"
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("actions")}
              aria-pressed={activeTab === "actions"}
              className={`flex-1 rounded-t-xl px-3 py-2 text-xs font-semibold transition ${
                activeTab === "actions"
                  ? "bg-navy-bg text-text-main"
                  : "text-text-secondary hover:text-text-main"
              }`}
            >
              AI Actions
            </button>
          </div>

          <div
            className={`min-h-0 flex-1 flex-col ${
              activeTab === "chat" ? "flex" : "hidden"
            }`}
            aria-hidden={activeTab !== "chat"}
          >
              <div
                ref={chatScrollRef}
                onScroll={(event) => {
                  const container = event.currentTarget;
                  shouldFollowMessagesRef.current =
                    container.scrollHeight -
                      container.scrollTop -
                      container.clientHeight <=
                    48;
                }}
                className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
                aria-live="polite"
              >
                {historyLoading && (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-text-secondary">
                    <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                    Loading conversation...
                  </div>
                )}

                {historyError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-300"
                  >
                    <p>{historyError}</p>
                    <button
                      type="button"
                      onClick={retryHistory}
                      className="mt-2 inline-flex items-center gap-1.5 font-semibold text-red-200 hover:text-white"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Retry loading conversation
                    </button>
                  </div>
                )}

                {!historyLoading && !historyError && messages.length === 0 && (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-navy-card to-navy-card p-4">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-bold tracking-tight text-text-main">
                        Your AI Project Assistant
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                        Your workspace, understood. Ask me to analyze issues,
                        compare sections, find themes in descriptions, or review
                        discussions
                        {boardTitle ? (
                          <>
                            {" "}on <span className="font-semibold text-text-main">{boardTitle}</span>
                          </>
                        ) : (
                          " on this board"
                        )}
                        .
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {promptCategories.map((category) => {
                        const CategoryIcon = category.icon;
                        return (
                          <section key={category.title} className="min-w-0">
                            <h4 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                              <CategoryIcon className="h-3.5 w-3.5 text-primary" />
                              {category.title}
                            </h4>
                            <div className="space-y-2">
                              {category.prompts.map((prompt) => {
                                const PromptIcon = prompt.icon;
                                return (
                                  <button
                                    key={prompt.text}
                                    type="button"
                                    disabled={
                                      loading ||
                                      historyLoading ||
                                      Boolean(historyError)
                                    }
                                    onClick={() => sendChatMessage(prompt.text)}
                                    className="group flex min-h-14 w-full items-start gap-2.5 rounded-xl border border-navy-border bg-navy-card px-3 py-2.5 text-left text-xs leading-relaxed text-text-secondary transition-colors hover:border-primary/50 hover:bg-navy-elevated hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <PromptIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted transition-colors group-hover:text-primary" />
                                    <span className="min-w-0 break-words">
                                      {prompt.text}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </section>
                        );
                      })}
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
                          : "rounded-bl-sm border border-navy-border bg-[#141E2D] text-text-main"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="message-content assistant-markdown">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => (
                                <h1 className="mb-3 mt-4 text-xl font-bold text-text-main first:mt-0">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="mb-2 mt-4 text-lg font-bold text-text-main first:mt-0">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="mb-2 mt-3 text-base font-bold text-text-main first:mt-0">
                                  {children}
                                </h3>
                              ),
                              p: ({ children }) => (
                                <p className="mb-3 whitespace-pre-wrap last:mb-0">
                                  {children}
                                </p>
                              ),
                              ul: ({ children }) => (
                                <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => <li className="pl-1">{children}</li>,
                              blockquote: ({ children }) => (
                                <blockquote className="my-3 border-l-2 border-primary/60 pl-3 text-text-secondary">
                                  {children}
                                </blockquote>
                              ),
                              a: ({ children, href }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary underline decoration-primary/50 underline-offset-2 hover:text-primary-hover"
                                >
                                  {children}
                                </a>
                              ),
                              pre: ({ children }) => (
                                <pre className="my-3 max-w-full overflow-x-auto rounded-lg border border-navy-border bg-[#080d16] p-3 text-xs leading-relaxed">
                                  {children}
                                </pre>
                              ),
                              code: ({ className, children }) => {
                                const isBlock =
                                  Boolean(className) ||
                                  String(children).includes("\n");
                                return (
                                  <code
                                    className={
                                      isBlock
                                        ? "font-mono text-text-main"
                                        : "rounded bg-navy-elevated px-1.5 py-0.5 font-mono text-[0.9em] text-primary"
                                    }
                                  >
                                    {children}
                                  </code>
                                );
                              },
                              table: ({ children }) => (
                                <div className="my-3 max-w-full overflow-x-auto">
                                  <table className="w-full border-collapse text-left text-xs">
                                    {children}
                                  </table>
                                </div>
                              ),
                              th: ({ children }) => (
                                <th className="whitespace-nowrap border border-navy-border bg-navy-elevated px-2 py-1.5 font-semibold">
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => (
                                <td className="border border-navy-border px-2 py-1.5 align-top">
                                  {children}
                                </td>
                              ),
                              hr: () => <hr className="my-3 border-navy-border" />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="message-content user-message-content">
                          {message.content}
                        </div>
                      )}
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
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-300"
                  >
                    <p>{error}</p>
                    {failedMessage && (
                      <button
                        type="button"
                        onClick={retryMessage}
                        disabled={loading || historyLoading}
                        className="mt-2 inline-flex items-center gap-1.5 font-semibold text-red-200 hover:text-white disabled:opacity-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Retry message
                      </button>
                    )}
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
                  disabled={
                    !boardId ||
                    !historyLoaded ||
                    historyLoading ||
                    Boolean(historyError)
                  }
                  className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-navy-border bg-navy-bg px-3 py-3 text-sm text-text-main outline-none transition placeholder:text-text-muted focus:border-primary disabled:opacity-60"
                  aria-label="Message to AI Board Assistant"
                />
                <button
                  type="submit"
                  disabled={
                    loading ||
                    historyLoading ||
                    !historyLoaded ||
                    Boolean(historyError) ||
                    Boolean(failedMessage) ||
                    !input.trim() ||
                    !boardId
                  }
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
                Proposed changes always require your approval.
              </p>
          </div>

          <div
            className={`min-h-0 flex-1 ${
              activeTab === "actions" ? "block" : "hidden"
            }`}
            aria-hidden={activeTab !== "actions"}
          >
            <AIActionsPanel
              boardId={boardId}
              refreshTrigger={actionsRefreshTrigger}
            />
          </div>
        </>
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setMinimized(false);
          setHasOpened(true);
          loadHistory();
        }}
        className={`fixed bottom-4 right-4 z-40 inline-flex h-12 max-w-[calc(100vw-2rem)] items-center gap-2.5 rounded-xl border border-navy-border bg-navy-card px-4 text-sm font-semibold text-text-main shadow-xl shadow-black/40 transition-[opacity,transform,background-color,border-color] duration-200 ease-out hover:border-primary/40 hover:bg-navy-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220] sm:bottom-6 sm:right-6 ${
          launcherVisible
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-90 opacity-0"
        }`}
        aria-label={minimized ? "Restore AI Assistant" : "Open AI Board Assistant"}
        aria-hidden={!launcherVisible}
        inert={!launcherVisible}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/15 text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="whitespace-nowrap max-[360px]:sr-only">AI Assistant</span>
      </button>
    </>
  );
};

export default BoardAssistant;
