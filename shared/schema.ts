import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: integer("is_admin").notNull().default(0), // 0 for user, 1 for admin
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // price in cents
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  type: text("type", { enum: ['creator', 'market'] }).notNull().default('creator'),
  status: text("status", { enum: ['available', 'sold', 'pending'] }).notNull().default('available'),
  imageUrl: text("image_url"),
  secretContent: text("secret_content"), // Encrypted ticket data/link/code
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  buyerId: integer("buyer_id").references(() => users.id).notNull(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  buyerId: integer("buyer_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(), // amount in cents
  status: text("status", { enum: ['pending', 'accepted', 'declined'] }).notNull().default('pending'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true }).extend({
  secretContent: z.string().min(1, "Ticket content is required for resale"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertOfferSchema = createInsertSchema(offers).omit({ id: true, createdAt: true, status: true });

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Offer = typeof offers.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

// Explicit API Contract Types
export type CreateTicketRequest = InsertTicket;
export type UpdateTicketRequest = Partial<InsertTicket>;
export type BuyTicketRequest = { ticketId: number };

export type TicketResponse = Ticket;
export type TicketsListResponse = Ticket[];
