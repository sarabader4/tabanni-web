import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE =
  "Hi! I'm Tabbani's AI assistant 🐾 I can help you find the perfect pet to adopt or foster, answer questions about the adoption process, or share tips on pet care in Jordan. How can I help you today?";

const QUICK_REPLIES = [
  "How do I adopt a pet?",
  "What pets are available?",
  "Tell me about fostering",
  "Pet care tips for Jordan",
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const updatedMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.slice(-10),
        }),
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json() as { reply: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const showQuickReplies = messages.length === 1 && !loading;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open AI chat assistant"}
        data-testid="ai-chat-toggle"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-110"
        style={{ background: open ? "#1E2A3A" : "#FF6B35" }}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col bg-white"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="px-5 py-4 flex items-center gap-3 shrink-0" style={{ background: "#1E2A3A" }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "#FF6B35" }}
            >
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Tabbani AI Assistant</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                <p className="text-green-400 text-xs">Online</p>
              </div>
            </div>
            <div className="ml-auto">
              <Sparkles className="w-4 h-4 text-orange-400" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#FFF8F3" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "text-white rounded-br-sm"
                      : "text-gray-800 rounded-bl-sm border border-orange-100"
                  }`}
                  style={msg.role === "user" ? { background: "#FF6B35" } : { background: "white" }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Quick Replies */}
            {showQuickReplies && (
              <div className="flex flex-col gap-2 pt-1">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="text-left px-4 py-2.5 rounded-xl text-xs font-medium text-gray-700 border border-orange-200 bg-white hover:bg-orange-50 hover:border-orange-400 transition-all"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-orange-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about pets..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-50"
                style={{ background: "#FF6B35" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
