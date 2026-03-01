import { motion } from "framer-motion";
import { useTickets } from "@/hooks/use-tickets";
import { TicketCard } from "@/components/ui/TicketCard";
import { Search } from "lucide-react";

export default function Market() {
  const { data: tickets, isLoading } = useTickets("market");

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Community Market
          </h1>
          <p className="text-lg text-white/60 max-w-2xl">
            Secure, verified fan-to-fan ticket resales. Find the tickets you missed or sell yours to someone else.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass rounded-2xl p-2 mb-10 flex items-center">
          <Search className="w-5 h-5 text-white/40 ml-4 mr-2" />
          <input 
            type="text" 
            placeholder="Search artists, venues, or cities..." 
            className="bg-transparent border-none outline-none text-white w-full py-3 px-2 placeholder:text-white/30"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-96 rounded-3xl glass-card animate-pulse bg-white/5" />
            ))}
          </div>
        ) : tickets?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TicketCard ticket={ticket} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass-card rounded-3xl">
            <h3 className="text-xl font-medium text-white mb-2">No tickets found</h3>
            <p className="text-white/50">Check back later for new listings.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
