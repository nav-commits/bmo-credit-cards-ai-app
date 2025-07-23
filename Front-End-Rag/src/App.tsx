import React, { useState, useEffect, useRef } from "react";
import BmoLogo from "./assets/bmo-logo.svg";

type Message = {
  type: "user" | "bot";
  content: string;
};

type ApiResponse = {
  answer: string;
};

function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data: ApiResponse = await response.json();
      const botMessage: Message = { type: "bot", content: data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError("❌ Failed to fetch answer. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 console.log("Messages:", messages);
  return (
    <div className="flex flex-col h-screen bg-[#F0F2F5] text-gray-900 font-sans">
      {/* Header */}
      <header className="text-white py-4 px-6 shadow-md sticky top-0 z-20 flex items-center">
        <img src={BmoLogo} alt="BMO Logo" className="h-10 w-auto" />
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
        <div className="space-y-5">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.type === "bot" && (
                <div className="flex-shrink-0 mr-3 mt-1 text-2xl select-none" aria-hidden="true">
                  🤖
                </div>
              )}
              <div
                className={`rounded-3xl px-5 py-4 text-sm max-w-[75%] shadow-md ${
                  msg.type === "user"
                    ? "bg-[#005DAA] text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
                style={{ lineHeight: 1.5 }}
              >
                {msg.content}
              </div>
              {msg.type === "user" && (
                <div className="flex-shrink-0 ml-3 mt-1 text-2xl select-none" aria-hidden="true">
                  🙋‍♂️
                </div>
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
            <div className="text-red-600 text-center font-semibold mt-2">{error}</div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="px-6 py-4 flex items-center gap-4 max-w-3xl mx-auto w-full sticky bottom-0 bg-[#F0F2F5]"
      >
        <textarea
          className="flex-1 resize-none border border-gray-300 rounded-2xl bg-white p-4 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005DAA] transition"
          placeholder="Ask something like: 'What is a TFSA?'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          rows={2}
          aria-label="Ask your question"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#005DAA] hover:bg-[#004B8D] text-white px-6 py-3 rounded-2xl shadow-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send question"
        >
          Send a Qustion
        </button>
      </form>
    </div>
  );
}

export default App;
