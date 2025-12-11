// src/models/chat.model.js

import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "../db/schema/users.js";
import { colleges } from "../db/schema/colleges.js";
import { subjects } from "../db/schema/subjects.js";

/**
 * chats table
 * - replaces Chat Mongoose model
 * - messages subdocuments are moved to chat_messages table
 */
export const chats = pgTable(
  "chats",
  {
    id: serial("id").primaryKey(),

    // studentId: ObjectId → integer FK
    studentId: integer("student_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    collegeId: integer("college_id")
      .references(() => colleges.id, { onDelete: "cascade" })
      .notNull(),

    subjectId: integer("subject_id").references(() => subjects.id),

    unit: integer("unit"),

    title: varchar("title", { length: 255 }),

    // messages are stored in chat_messages table, not here

    // contextContentIds: [ObjectId] → JSONB int[] cache
    contextContentIds: jsonb("context_content_ids").default([]),

    lastMessage: text("last_message").default(""),
    lastMessageAt: timestamp("last_message_at", {
      withTimezone: false,
      mode: "date",
    }).defaultNow(),

    isActive: boolean("is_active").default(true).notNull(),

    aiAgentType: varchar("ai_agent_type", { length: 64 }).default("doubt_solver"),

    createdAt: timestamp("created_at", {
      withTimezone: false,
      mode: "date",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: false,
      mode: "date",
    }).defaultNow(),
  },
  (table) => ({
    // chatSchema.index({ studentId: 1, updatedAt: -1 });
    studentUpdatedIdx: index("chats_student_updated_idx").on(
      table.studentId,
      table.updatedAt,
    ),
    // chatSchema.index({ collegeId: 1, subjectId: 1 });
    collegeSubjectIdx: index("chats_college_subject_idx").on(
      table.collegeId,
      table.subjectId,
    ),
    // chatSchema.index({ lastMessageAt: -1 });
    lastMessageAtIdx: index("chats_last_message_at_idx").on(table.lastMessageAt),
    // chatSchema.index({ aiAgentType: 1 });
    aiAgentTypeIdx: index("chats_ai_agent_type_idx").on(table.aiAgentType),
    // chatSchema.index({ isActive: 1 });
    isActiveIdx: index("chats_is_active_idx").on(table.isActive),
  }),
);

/**
 * chat_messages table
 * - replaces embedded messageSchema + messages[]
 */
export const chatMessages = pgTable(
  "chat_messages",
  {
    id: serial("id").primaryKey(),

    chatId: integer("chat_id")
      .references(() => chats.id, { onDelete: "cascade" })
      .notNull(),

    role: varchar("role", { length: 32 }).notNull(), // "user" | "assistant" | "system"

    content: text("content").notNull(),

    timestamp: timestamp("timestamp", {
      withTimezone: false,
      mode: "date",
    }).defaultNow(),

    // RAG sources: array of subdocuments → JSONB array of objects
    // [{ contentId, chunk, relevanceScore, chunkIndex }, ...]
    sources: jsonb("sources"),
    // e.g. [
    //   {
    //     contentId: 123,         // maps from Content.id
    //     chunk: "text",
    //     relevanceScore: 0.92,
    //     chunkIndex: 4
    //   }
    // ]

    // aiMeta: { model, latencyMs, tokensUsed, confidence } → JSONB object
    aiMeta: jsonb("ai_meta"),
  },
  (table) => ({
    chatTimeIdx: index("chat_messages_chat_time_idx").on(
      table.chatId,
      table.timestamp,
    ),
  }),
);

/**
 * Helper functions that replace common Mongoose operations.
 * Import these in your services/controllers instead of using Chat.find(), etc.
 */

import { db } from "../db/index.js";
import { eq, desc } from "drizzle-orm";

// Chat.find({ studentId }).sort({ updatedAt: -1 })
export async function findChatsByStudent(studentId) {
  const rows = await db
    .select()
    .from(chats)
    .where(eq(chats.studentId, studentId))
    .orderBy(desc(chats.updatedAt));

  return rows;
}

// Chat.findById(chatId)
export async function findChatById(chatId) {
  const rows = await db
    .select()
    .from(chats)
    .where(eq(chats.id, chatId))
    .limit(1);

  return rows[0] || null;
}

// new Chat(data).save()
export async function createChat(data) {
  const [row] = await db.insert(chats).values(data).returning();
  return row;
}

// Chat.updateOne({ _id: chatId }, update)
export async function updateChatById(chatId, update) {
  const [row] = await db
    .update(chats)
    .set({ ...update, updatedAt: new Date() })
    .where(eq(chats.id, chatId))
    .returning();

  return row;
}

// push message + emulate pre-save hook behavior (update lastMessage & lastMessageAt)
export async function addMessage(chatId, message) {
  const ts = message.timestamp || new Date();

  await db.transaction(async (tx) => {
    await tx.insert(chatMessages).values({
      chatId,
      role: message.role,
      content: message.content,
      timestamp: ts,
      sources: message.sources || null,
      aiMeta: message.aiMeta || null,
    });

    await tx
      .update(chats)
      .set({
        lastMessage: message.content.substring(0, 200),
        lastMessageAt: ts,
        updatedAt: new Date(),
      })
      .where(eq(chats.id, chatId));
  });
}

// emulate Chat.populate('messages') by manual join
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
