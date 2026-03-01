import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type TicketInput } from "@shared/routes";

// Utility to parse errors and provide a safe fallback
const safeFetch = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, { ...options, credentials: "include" });
  if (!res.ok) {
    let message = "An error occurred";
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      message = res.statusText || message;
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
};

export function useTickets(type?: 'creator' | 'market', status?: 'available' | 'sold') {
  return useQuery({
    queryKey: [api.tickets.list.path, type, status],
    queryFn: async () => {
      const url = new URL(api.tickets.list.path, window.location.origin);
      if (type) url.searchParams.append('type', type);
      if (status) url.searchParams.append('status', status);
      
      const data = await safeFetch(url.toString());
      return api.tickets.list.responses[200].parse(data);
    },
  });
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: [api.tickets.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tickets.get.path, { id });
      const data = await safeFetch(url);
      return api.tickets.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TicketInput) => {
      const validated = api.tickets.create.input.parse(data);
      const resData = await safeFetch(api.tickets.create.path, {
        method: api.tickets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      return api.tickets.create.responses[201].parse(resData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tickets.list.path] });
    },
  });
}

export function useBuyTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ticketId: number) => {
      const url = buildUrl(api.tickets.buy.path, { id: ticketId });
      const resData = await safeFetch(url, {
        method: api.tickets.buy.method,
      });
      return api.tickets.buy.responses[200].parse(resData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tickets.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.tickets.get.path] });
    },
  });
}
