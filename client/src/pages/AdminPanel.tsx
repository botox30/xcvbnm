import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, X, Shield, AlertCircle, Loader2 } from "lucide-react";
import { useTickets } from "@/hooks/use-tickets";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingTickets, isLoading: ticketsLoading } = useTickets("market", "pending" as any);

  const verifyMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/tickets/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Verification failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({ title: "Success", description: "Ticket status updated." });
    },
  });

  if (authLoading || ticketsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!user || user.isAdmin !== 1) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center border border-accent/30">
          <Shield className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Admin Control</h1>
          <p className="text-white/40">Verify and manage community marketplace listings.</p>
        </div>
      </div>

      {!pendingTickets?.length ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-20 text-center border border-white/5"
        >
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white/20" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">Queue is clear</h2>
          <p className="text-white/40">No tickets are currently awaiting verification.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingTickets.map((ticket: any) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center border border-white/10"
            >
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={ticket.imageUrl || ""} className="w-full h-full object-cover" alt="" />
              </div>
              
              <div className="flex-grow space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h3 className="text-xl font-bold text-white">{ticket.title}</h3>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-yellow-500/30">
                    Awaiting Approval
                  </span>
                </div>
                <p className="text-white/60 text-sm line-clamp-2">{ticket.description}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-white/40 font-medium pt-2">
                  <span>Price: <span className="text-white">{(ticket.price / 100).toFixed(2)}zł</span></span>
                  <span>Location: <span className="text-white">{ticket.location}</span></span>
                  <span>Date: <span className="text-white">{format(new Date(ticket.date), "PPP")}</span></span>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => verifyMutation.mutate({ id: ticket.id, status: "available" })}
                  disabled={verifyMutation.isPending}
                  className="flex-1 md:flex-none h-12 px-6 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Approve
                </button>
                <button
                  disabled={verifyMutation.isPending}
                  className="flex-1 md:flex-none h-12 px-6 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
