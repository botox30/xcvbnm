import { db } from "./db";
import {
  users, tickets,
  type User, type InsertUser,
  type Ticket, type InsertTicket,
  type UpdateTicketRequest,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
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
}

export const storage = new DatabaseStorage();
