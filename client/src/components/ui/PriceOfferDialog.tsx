import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingDown } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { useToast } from "@/hooks/use-toast";
import type { Offer, Conversation } from "@shared/schema";

interface PriceOfferDialogProps {
  conversation: Conversation & { ticket: any };
  currentUserId: number;
  isBuyer: boolean;
  onClose: () => void;
}

export function PriceOfferDialog({
  conversation,
  currentUserId,
  isBuyer,
  onClose,
}: PriceOfferDialogProps) {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [newOfferAmount, setNewOfferAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversation.id}/offers`);
        const data = await response.json();
        setOffers(data);
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, [conversation.id]);

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferAmount.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/conversations/${conversation.id}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(parseFloat(newOfferAmount) * 100) }),
      });
      const offer = await response.json();
      setOffers([...offers, offer]);
      setNewOfferAmount("");
      toast({
        variant: "success",
        title: "Offer Sent",
        description: "Your price offer has been sent to the seller.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send offer",
      });
      console.error("Failed to submit offer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfferResponse = async (offerId: number, status: "accepted" | "declined") => {
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await response.json();
      setOffers(offers.map((o) => (o.id === offerId ? updated : o)));
      toast({
        variant: "success",
        title: `Offer ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        description: `You have ${status} the price offer.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update offer",
      });
      console.error("Failed to update offer:", error);
    }
  };

  const originalPrice = conversation.ticket.price / 100;
  const pendingOffers = offers.filter((o) => o.status === "pending");
  const acceptedOffers = offers.filter((o) => o.status === "accepted");
  const declinedOffers = offers.filter((o) => o.status === "declined");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-end md:justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Offer Dialog */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="relative w-full md:w-96 max-h-[600px] glass rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Price Offer</h3>
              <p className="text-white/50 text-xs">Original: {originalPrice.toFixed(2)}zł</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Make Offer Section */}
          {isBuyer && (
            <div className="space-y-3">
              <h4 className="text-white font-medium text-sm">Make an Offer</h4>
              <form onSubmit={handleSubmitOffer} className="space-y-3">
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={newOfferAmount}
                    onChange={(e) => setNewOfferAmount(e.target.value)}
                    placeholder="Enter your offer..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-sm">
                    zł
                  </span>
                </div>
                <Button
                  type="submit"
                  disabled={!newOfferAmount.trim() || isSubmitting}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSubmitting ? "Sending..." : "Send Offer"}
                </Button>
              </form>
              <div className="h-px bg-white/10" />
            </div>
          )}

          {/* Pending Offers */}
          {pendingOffers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium text-sm">Pending Offers</h4>
              <div className="space-y-2">
                {pendingOffers.map((offer) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-semibold">
                        {(offer.amount / 100).toFixed(2)}zł
                      </span>
                      <span className="text-white/50 text-xs">
                        {(((offer.amount / conversation.ticket.price) * 100) - 100).toFixed(0)}%
                      </span>
                    </div>
                    {!isBuyer && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleOfferResponse(offer.id, "accepted")}
                          className="flex-1 bg-green-500/80 hover:bg-green-600 text-white text-xs py-2"
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleOfferResponse(offer.id, "declined")}
                          className="flex-1 bg-red-500/80 hover:bg-red-600 text-white text-xs py-2"
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              {acceptedOffers.length > 0 || declinedOffers.length > 0 ? (
                <div className="h-px bg-white/10" />
              ) : null}
            </div>
          )}

          {/* Accepted Offers */}
          {acceptedOffers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium text-sm text-green-400">Accepted Offers</h4>
              <div className="space-y-2">
                {acceptedOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4"
                  >
                    <span className="text-green-400 font-semibold">
                      {(offer.amount / 100).toFixed(2)}zł
                    </span>
                  </div>
                ))}
              </div>
              {declinedOffers.length > 0 ? <div className="h-px bg-white/10" /> : null}
            </div>
          )}

          {/* Declined Offers */}
          {declinedOffers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium text-sm text-red-400">Declined Offers</h4>
              <div className="space-y-2">
                {declinedOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4"
                  >
                    <span className="text-red-400 font-semibold">
                      {(offer.amount / 100).toFixed(2)}zł
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/30" />
            </div>
          )}

          {!isLoading && offers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/50 text-sm">No offers yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
