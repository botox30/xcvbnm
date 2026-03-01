import { db } from "./db";
import {
  users, tickets, conversations, messages, offers,
  type User, type InsertUser,
  type Ticket, type InsertTicket,
  type UpdateTicketRequest,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type Offer, type InsertOffer,
} from "@shared/schema";
import { eq, and, or } from "drizzle-orm";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getTickets(type?: 'creator' | 'market', status?: 'available' | 'sold'): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, updates: UpdateTicketRequest): Promise<Ticket | undefined>;

  // Chat & Offers
  getConversations(userId: number): Promise<(Conversation & { ticket: Ticket; buyer: User; seller: User })[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByTicketAndBuyer(ticketId: number, buyerId: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getOffers(conversationId: number): Promise<Offer[]>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOfferStatus(id: number, status: 'accepted' | 'declined'): Promise<Offer | undefined>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new SessionStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTickets(type?: 'creator' | 'market', status?: 'available' | 'sold'): Promise<Ticket[]> {
    let query = db.select().from(tickets);
    
    const conditions = [];
    if (type) conditions.push(eq(tickets.type, type));
    if (status) conditions.push(eq(tickets.status, status));
    
    if (conditions.length > 0) {
      // @ts-ignore
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    if (ticket) {
      // Scrub secret content from public view
      const { secretContent, ...publicTicket } = ticket;
      return publicTicket as Ticket;
    }
    return undefined;
  }

  async getTicketWithSecrets(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [newTicket] = await db.insert(tickets).values(ticket).returning();
    return newTicket;
  }

  async updateTicket(id: number, updates: UpdateTicketRequest): Promise<Ticket | undefined> {
    const [updated] = await db.update(tickets)
      .set(updates)
      .where(eq(tickets.id, id))
      .returning();
    return updated;
  }

  // Chat & Offers
  async getConversations(userId: number): Promise<(Conversation & { ticket: Ticket; buyer: User; seller: User })[]> {
    const results = await db.select({
      conversation: conversations,
      ticket: tickets,
      buyer: users,
      seller: users,
    })
    .from(conversations)
    .innerJoin(tickets, eq(conversations.ticketId, tickets.id))
    .innerJoin(users, eq(conversations.buyerId, users.id))
    // We need to join users twice, but drizzle join syntax for the same table requires aliases or careful handling.
    // For simplicity in this sandbox, let's fetch and map.
    .where(or(eq(conversations.buyerId, userId), eq(conversations.sellerId, userId)));

    // Since we can't easily do double join with same table in simple drizzle without aliases, 
    // let's just get the basic conversations and then hydrate them if needed, 
    // or use a more manual approach.
    
    const hydratedConversations = await Promise.all(results.map(async (r) => {
      const [buyer] = await db.select().from(users).where(eq(users.id, r.conversation.buyerId));
      const [seller] = await db.select().from(users).where(eq(users.id, r.conversation.sellerId));
      return {
        ...r.conversation,
        ticket: r.ticket,
        buyer: buyer!,
        seller: seller!,
      };
    }));

    return hydratedConversations;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getConversationByTicketAndBuyer(ticketId: number, buyerId: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(
      and(eq(conversations.ticketId, ticketId), eq(conversations.buyerId, buyerId))
    );
    return conversation;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getOffers(conversationId: number): Promise<Offer[]> {
    return await db.select().from(offers).where(eq(offers.conversationId, conversationId));
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const [newOffer] = await db.insert(offers).values(offer).returning();
    return newOffer;
  }

  async updateOfferStatus(id: number, status: 'accepted' | 'declined'): Promise<Offer | undefined> {
    const [updated] = await db.update(offers)
      .set({ status })
      .where(eq(offers.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
