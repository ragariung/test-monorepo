import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { ChatError, getOrCreateSessionId, sendChatMessage } from '../../lib/chat-api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Halo! Saya Asisten PRAXIS. Tanyakan apa saja seputar produk asuransi PRAXIS, atau beri tahu saya jika Anda ingin dihubungi oleh tim kami.',
};

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const sessionIdRef = useRef<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!sessionIdRef.current) {
    sessionIdRef.current = getOrCreateSessionId();
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const reply = await sendChatMessage(trimmed, sessionIdRef.current);
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: reply }]);
    } catch (err) {
      const message =
        err instanceof ChatError ? err.message : 'Terjadi kesalahan tak terduga. Coba lagi.';
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: 'assistant', text: message }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="mb-3 w-[22rem] sm:w-96 h-[30rem] max-h-[75vh] bg-white rounded-2xl shadow-soft-lg border border-slate-200 flex flex-col overflow-hidden"
            role="dialog"
            aria-label="Obrolan dengan Asisten PRAXIS"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-[#0F4C5C] text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <MessageCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">Asisten PRAXIS</p>
                  <p className="text-[11px] text-white/70 leading-tight">Biasanya membalas seketika</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Tutup obrolan"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-2.5 bg-slate-50">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[#0F4C5C] text-white rounded-br-sm'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSending}
                  placeholder="Tulis pertanyaan Anda..."
                  className="flex-1 text-sm px-3.5 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/30 focus:border-[#0F4C5C] disabled:opacity-60"
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !input.trim()}
                  className="w-10 h-10 shrink-0 rounded-full bg-[#F27D26] text-white flex items-center justify-center hover:bg-[#e06b16] active:bg-[#c95d0f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Kirim pesan"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full bg-[#0F4C5C] hover:bg-[#0a3a46] text-white flex items-center justify-center shadow-soft-lg cursor-pointer transition-colors"
        aria-label={isOpen ? 'Tutup obrolan asisten PRAXIS' : 'Buka obrolan asisten PRAXIS'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? 'close' : 'open'}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
