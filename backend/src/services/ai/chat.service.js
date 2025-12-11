// src/services/chat.service.js
import { db } from "../db/index.js";
import { chats } from "../db/schema/chats.js";
import { chatMessages } from "../db/schema/chatMessages.js";
import { eq, desc } from "drizzle-orm";

// Chat.find({ studentId }).sort({ updatedAt: -1 })
export async function listChatsForStudent(studentId) {
  const rows = await db
    .select()
    .from(chats)
    .where(eq(chats.studentId, studentId))
    .orderBy(desc(chats.updatedAt));

  return rows;
}

// Chat.findById(chatId)
export async function getChatById(chatId) {
  const rows = await db
    .select()
    .from(chats)
    .where(eq(chats.id, chatId))
    .limit(1);

  return rows[0] || null;
}

// new Chat({...}).save()
export async function createChat(payload) {
  const [row] = await db.insert(chats).values(payload).returning();
  return row;
}

// pre-save hook equivalent: add message + update lastMessage / lastMessageAt
export async function addMessageToChat(chatId, msg) {
  const ts = msg.timestamp || new Date();

  await db.transaction(async (tx) => {
    await tx.insert(chatMessages).values({
      chatId,
      role: msg.role,
      content: msg.content,
      timestamp: ts,
      sources: msg.sources || null,
      aiMeta: msg.aiMeta || null,
    });

    await tx
      .update(chats)
      .set({
        lastMessage: msg.content.substring(0, 200),
        lastMessageAt: ts,
        updatedAt: new Date(),
      })
      .where(eq(chats.id, chatId));
  });
}

// populate-like: chat + messages
export async function getChatWithMessages(chatId) {
  const chatRows = await db
    .select()
    .from(chats)
    .where(eq(chats.id, chatId))
    .limit(1);

  const chat = chatRows[0];
  if (!chat) return null;

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.chatId, chatId))
    .orderBy(chatMessages.timestamp);

  return { chat, messages };
}
