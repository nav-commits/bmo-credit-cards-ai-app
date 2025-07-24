import React, { useState, useEffect, useRef } from "react";
import BmoLogo from "./assets/bmo-logo.svg";

type Message = {
  type: "user" | "bot";
  content: string;
};

type ApiResponse = {
  answer: string;
};

type Chat = {
  id: number;
  title: string;
};
const chats: Array<Chat> = [
  { id: 1, title: "All Cards" },
  { id: 2, title: "No Fee" },
  { id: 3, title: "Low Interest" },
];

function App() {
  const [query, setQuery] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeChatId === 1) {
      setMessages([
        {
          type: "bot",
          content:
            "Looking for a credit card? I can help you choose one that fits your needs.",
        },
      ]);
    } else if (activeChatId === 2) {
      setMessages([
        {
          type: "bot",
          content:
            "Want to compare BMO credit cards? Let's break down the benefits and features.",
        },
      ]);
    } else if (activeChatId === 3) {
      setMessages([
        {
          type: "bot",
          content:
            "Need help activating your BMO credit card or managing your account online? I'm here to assist.",
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage: Message = { type: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    setQuery("");

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data: ApiResponse = await response.json();
      const botMessage: Message = { type: "bot", content: data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError("Failed to fetch answer. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] text-gray-900 font-sans">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <img src={BmoLogo} alt="BMO Logo" className="h-10 w-auto" />
          {/* Close button on mobile */}
          <button
            className="ml-auto md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul>
            {chats.map((chat) => (
              <li key={chat.id}>
                <button
                  onClick={() => {
                    setActiveChatId(chat.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 border-b border-gray-100 hover:bg-[#E1EFFE] transition-colors ${
                    activeChatId === chat.id
                      ? "bg-[#005DAA] text-white font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {chat.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay behind sidebar on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main chat area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className=" py-4 px-6 shadow-md sticky top-0 z-20 flex items-center bg-white">
          {/* Sidebar toggle button - visible only on mobile/tablet */}
          <button
            className="mr-4 md:hidden text-blue focus:outline-none"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <img src={BmoLogo} alt="BMO Logo" className="h-10 w-auto" />
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full">
          <div className="space-y-5">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.type === "bot" && (
                  <div
                    className="flex-shrink-0 mr-3 mt-1 text-2xl select-none"
                    aria-hidden="true"
                  ></div>
                )}
                <div
                  className={`rounded-3xl px-4 sm:px-5 py-3 sm:py-4 text-sm max-w-[75%] shadow-md ${
                    msg.type === "user"
                      ? "bg-[#005DAA] text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                  style={{ lineHeight: 1.5 }}
                >
                  {msg.content}
                </div>
                {msg.type === "user" && (
                  <div
                    className="flex-shrink-0 ml-3 mt-1 text-2xl select-none"
                    aria-hidden="true"
                  ></div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-300 px-5 py-4 rounded-3xl text-sm shadow animate-pulse">
                  Thinking...
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 text-center font-semibold mt-2">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </main>

        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className="px-4 sm:px-6 py-4 flex items-center gap-4 max-w-3xl mx-auto w-full sticky bottom-0 bg-[#F0F2F5]"
        >
          <textarea
            className="flex-1 resize-none border border-gray-300 rounded-2xl bg-white p-3 sm:p-4 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005DAA] transition"
            placeholder="Ask something like: 'What is a TFSA?'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading || !activeChatId}
            rows={2}
            aria-label="Ask your question"
          />
          <button
            type="submit"
            disabled={loading || !activeChatId}
            className="bg-[#005DAA] hover:bg-[#004B8D] text-white px-5 sm:px-6 py-3 rounded-2xl shadow-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send question"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
