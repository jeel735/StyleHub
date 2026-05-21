import { useState, useRef, useEffect } from "react";
import axios from "axios";

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "👋 Hi! I'm StyleBot, your personal fashion assistant. Ask me about products, outfits, or store policies!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", text: trimmed };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const history = updatedMessages.slice(1, -1);

      const { data } = await axios.post("/api/chatbot/chat", {
        message: trimmed,
        history,
      });

      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Sorry, I'm having trouble responding right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "bot",
        text: "👋 Hi! I'm StyleBot, your personal fashion assistant. Ask me about products, outfits, or store policies!",
      },
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 bg-black text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-gray-800 transition-all duration-300"
        title="Chat with StyleBot"
      >
        {isOpen ? "✕" : "🛍️"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[560px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛍️</span>
              <div>
                <p className="font-semibold text-sm">StyleBot</p>
                <p className="text-xs text-gray-300">Fashion Assistant • Online</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="text-xs text-gray-400 hover:text-white transition"
              title="Clear chat"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 max-h-[400px]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "bot" && (
                  <span className="text-lg mr-2 self-end">🤖</span>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-black text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex justify-start items-end gap-2">
                <span className="text-lg">🤖</span>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about styles, products..."
              className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-black transition"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-black text-white text-sm px-4 py-2 rounded-full hover:bg-gray-800 disabled:opacity-40 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatBot;