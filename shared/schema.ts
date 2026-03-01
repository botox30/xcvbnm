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

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true }).extend({
  secretContent: z.string().min(1, "Ticket content is required for resale"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

// Explicit API Contract Types
export type CreateTicketRequest = InsertTicket;
export type UpdateTicketRequest = Partial<InsertTicket>;
export type BuyTicketRequest = { ticketId: number };

export type TicketResponse = Ticket;
export type TicketsListResponse = Ticket[];
