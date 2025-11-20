'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // New ref for the input field

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages, 
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage: Message = { role: 'model', parts: [{ text: data.response }] };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = { role: 'model', parts: [{ text: "Error: Something went wrong. Even I can't fix stupid sometimes. (Check your API key)" }] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="z-10 w-full max-w-3xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Jerkwad AI
        </h1>
        <p className="text-gray-400 mt-2 lg:mt-0">Don't say I didn't warn you.</p>
      </div>

      <div className="flex-1 w-full max-w-3xl bg-gray-900 rounded-lg shadow-2xl border border-gray-800 overflow-hidden flex flex-col h-[75vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {messages.length === 0 && (
            <div className="text-center text-gray-600 mt-20 flex flex-col items-center">
              <div className="text-6xl mb-4">🙄</div>
              <p>Go ahead, ask me something. I dare you.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.parts[0].text}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl rounded-bl-none px-4 py-2 text-gray-500 animate-pulse border border-gray-700">
                Thinking of a mean insult...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-gray-900 border-t border-gray-800 flex gap-3">
          <input
            ref={inputRef} // Added ref to the input field
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your stupid question here..."
            className="flex-1 bg-gray-950 text-white border border-gray-700 rounded-full px-5 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            // disabled={isLoading}  <-- Removed this line so input stays focused
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg hover:shadow-purple-500/25"
          >
            Send
          </button>
        </form>
      </div>
      
      <div className="mt-8 text-xs text-gray-600 font-mono">
        Powered by Gemini (unfortunately)
      </div>
    </main>
  );
}