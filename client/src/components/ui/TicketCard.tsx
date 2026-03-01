import { format } from "date-fns";
import { MapPin, Calendar, CheckCircle2, MessageSquare, TrendingDown } from "lucide-react";
import { type Ticket } from "@shared/schema";
import { useLocation } from "wouter";

interface TicketCardProps {
  ticket: Ticket;
  onChat?: (ticketId: number) => void;
  onOffer?: (ticketId: number) => void;
}

export function TicketCard({ ticket, onChat, onOffer }: TicketCardProps) {
  const [, setLocation] = useLocation();
  const isAvailable = ticket.status === "available";

  // Fallback image if none provided
  const imageUrl = ticket.imageUrl || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop";

  return (
    <>
      <div className="glass-card rounded-3xl overflow-hidden flex flex-col group h-full">
        {/* Image Section */}
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <img 
            src={imageUrl} 
            alt={ticket.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute top-4 left-4 z-20">
            <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-md ${
              ticket.type === 'creator' 
                ? 'bg-blue-500/80 text-white border border-blue-400/50' 
                : 'bg-purple-500/80 text-white border border-purple-400/50'
            }`}>
              {ticket.type === 'creator' ? 'Official' : 'Resale'}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-4 gap-4">
            <h3 className="text-xl font-semibold text-white leading-tight line-clamp-2">
              {ticket.title}
            </h3>
            <div className="text-right">
              <span className="text-2xl font-bold text-white tracking-tight">
                {(ticket.price / 100).toFixed(2)}zł
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-6 text-white/70 text-sm flex-grow">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/50" />
              <span>{format(new Date(ticket.date), "MMMM d, yyyy • h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white/50" />
              <span className="truncate">{ticket.location}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {ticket.type === "market" ? (
            <div className="space-y-3">
              <button 
                onClick={() => isAvailable && setLocation(`/checkout/${ticket.id}`)}
                disabled={!isAvailable}
                className={`w-full py-3 rounded-2xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  isAvailable 
                    ? "bg-white text-black hover:bg-white/90 active:scale-[0.98]" 
                    : "bg-white/10 text-white/40 cursor-not-allowed"
                }`}
              >
                {isAvailable ? "Buy Now" : "Sold Out"}
                {!isAvailable && <CheckCircle2 className="w-4 h-4" />}
              </button>
              {isAvailable && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onChat?.(ticket.id)}
                    className="flex-1 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </button>
                  <button
                    onClick={() => onOffer?.(ticket.id)}
                    className="flex-1 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <TrendingDown className="w-4 h-4" />
                    Offer
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => isAvailable && setLocation(`/checkout/${ticket.id}`)}
              disabled={!isAvailable}
              className={`w-full py-4 rounded-2xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                isAvailable 
                  ? "bg-white text-black hover:bg-white/90 active:scale-[0.98]" 
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              }`}
            >
              {isAvailable ? "Get Tickets" : "Sold Out"}
              {!isAvailable && <CheckCircle2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
