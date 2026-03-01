import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateTicket } from "@/hooks/use-tickets";
import { useToast } from "@/hooks/use-toast";
import { Ticket, Calendar, MapPin, DollarSign, Image as ImageIcon, Link as LinkIcon, Loader2, Lock } from "lucide-react";

export default function CreateTicket() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateTicket();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    date: "",
    location: "",
    imageUrl: "",
    secretContent: "",
  });
  const [tmUrl, setTmUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  const handleImportTemplate = async () => {
    if (!tmUrl) return;
    setIsScraping(true);
    try {
      const res = await fetch("/api/scrape-ticketmaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tmUrl }),
      });
      if (!res.ok) throw new Error("Failed to import template");
      const data = await res.json();
      
      setFormData({
        ...formData,
        title: data.title,
        description: data.description,
        location: data.location,
        date: data.date.slice(0, 16), // Format for datetime-local
        imageUrl: data.imageUrl,
      });

      toast({
        variant: "success",
        title: "Template Imported!",
        description: "Event details have been filled from Ticketmaster.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Could not fetch event details from the provided link.",
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        price: Math.round(parseFloat(formData.price) * 100), // convert to cents
        date: new Date(formData.date),
        location: formData.location,
        imageUrl: formData.imageUrl || null,
        secretContent: formData.secretContent,
        type: "market",
        status: "available",
        sellerId: 1, // Mocked seller ID for now
      });
      
      toast({
        variant: "success",
        title: "Ticket Listed!",
        description: "Your ticket is now live on the market.",
      });
      setLocation("/market");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create listing",
      });
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all";

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-3xl p-8 md:p-12 shadow-2xl"
      >
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
            Sell a Ticket
          </h1>
          <p className="text-white/60">
            List your ticket securely on the restage community market.
          </p>
        </div>

        <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
          <label className="block text-sm font-medium text-white/80 mb-3">Import from Ticketmaster</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="url"
                placeholder="Paste Ticketmaster event link..."
                className={`${inputClass} pl-10 py-2.5 text-sm`}
                value={tmUrl}
                onChange={e => setTmUrl(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleImportTemplate}
              disabled={isScraping || !tmUrl}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isScraping ? <Loader2 className="w-4 h-4 animate-spin" /> : "Import"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-white/40">
            Importing a template will automatically fill event details. You'll still need to provide your actual ticket later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Event Title</label>
              <input
                required
                type="text"
                placeholder="e.g., The Weeknd - After Hours Tour"
                className={inputClass}
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
              <textarea
                required
                rows={3}
                placeholder="Details about seat location, ticket type..."
                className={`${inputClass} resize-none`}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Price (PLN)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="150.00"
                    className={`${inputClass} pl-10`}
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Date & Time</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    required
                    type="datetime-local"
                    className={`${inputClass} pl-10 [color-scheme:dark]`}
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Venue / Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  required
                  type="text"
                  placeholder="PGE Narodowy, Warsaw"
                  className={`${inputClass} pl-10`}
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Image URL (Optional)</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  className={`${inputClass} pl-10`}
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Ticket Content (Secret)</label>
              <div className="relative">
                <div className="absolute left-3 top-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="Paste your PDF link, QR code text, or unique ticket ID here. This is only shown to the buyer after purchase."
                  className={`${inputClass} pl-10 resize-none`}
                  value={formData.secretContent}
                  onChange={e => setFormData({...formData, secretContent: e.target.value})}
                />
              </div>
              <p className="mt-2 text-[11px] text-white/40 italic">
                Restage uses end-to-end protection. This data is encrypted and hidden from everyone until a successful payment is confirmed.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-4 rounded-xl bg-white text-black font-semibold text-lg transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? "Listing..." : "List Ticket for Sale"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
