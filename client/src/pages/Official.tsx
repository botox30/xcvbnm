import { motion } from "framer-motion";
import { useTickets } from "@/hooks/use-tickets";
import { TicketCard } from "@/components/ui/TicketCard";

export default function Official() {
  const { data: tickets, isLoading } = useTickets("creator");

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-12 md:mb-16 text-center">
          <span className="text-accent font-medium tracking-wider uppercase text-sm mb-4 block">Official Selection</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 text-glow">
            Curated Experiences
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light">
            Directly from the creators to you. Discover our handpicked selection of upcoming official concerts.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] rounded-3xl glass-card animate-pulse bg-white/5" />
            ))}
          </div>
        ) : tickets?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <h3 className="text-xl font-medium text-white mb-2">Stay Tuned</h3>
            <p className="text-white/50">New official events are dropping soon.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
