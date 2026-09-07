/**
 * Thin client for the PRAXIS Assistant chatbot, served by the n8n workflow
 * in ../../../Automation/ (see Automation/README.md) - not the Backends/
 * NestJS API. Kept separate from api.ts since it talks to a different
 * backend with a different contract (n8n's Chat Trigger shape, not
 * Docs/API-LIST-V0.md).
 */

const CHAT_WEBHOOK_URL: string =
  (import.meta as any).env?.VITE_CHAT_WEBHOOK_URL ||
  'http://localhost:5678/webhook/72ce3642-177d-4104-be42-558158ac11d4/chat';

const SESSION_STORAGE_KEY = 'praxis_chat_session_id';

export function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}

export class ChatError extends Error {}

export async function sendChatMessage(chatInput: string, sessionId: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(CHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatInput, sessionId }),
    });
  } catch {
    throw new ChatError('Tidak dapat terhubung ke asisten PRAXIS. Periksa koneksi Anda.');
  }

  if (!res.ok) {
    throw new ChatError(`Asisten sedang mengalami gangguan (${res.status}). Coba lagi sebentar lagi.`);
  }

  const data = await res.json().catch(() => null);
  if (typeof data?.output === 'string') {
    return data.output;
  }

  throw new ChatError('Asisten memberikan respons yang tidak dapat dibaca.');
}
