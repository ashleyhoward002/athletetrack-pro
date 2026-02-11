"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface RagChatProps {
    sport?: string;
}

export default function RagChat({ sport = "basketball" }: RagChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Ask me anything about your uploaded documents or stats!" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: userMsg, sport }),
            });

            if (!response.ok) throw new Error("Chat failed");

            const data = await response.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
        } catch (error) {
            toast.error("Failed to get answer");
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card bg-base-200 h-[600px] flex flex-col">
            <div className="card-body flex-1 overflow-hidden p-0">
                <div className="h-full flex flex-col">
                    <div className="p-4 bg-base-300">
                        <h3 className="font-bold">AI Coach (Gemini RAG)</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}>
                                <div className={`chat-bubble ${msg.role === "user" ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat chat-start">
                                <div className="chat-bubble chat-bubble-secondary">
                                    <span className="loading loading-dots loading-xs"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 bg-base-300 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="input input-bordered flex-1"
                            disabled={loading}
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
