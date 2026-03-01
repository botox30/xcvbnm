import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  Ticket as TicketIcon,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useTicket, useBuyTicket } from "@/hooks/use-tickets";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Checkout() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { data: ticket, isLoading: ticketLoading } = useTicket(Number(id));
  const buyMutation = useBuyTicket();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [purchasedTicket, setPurchasedTicket] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
    if (user) {
      setEmail(user.username + "@example.com"); // Mocking email for the UI
    }
  }, [user, authLoading, setLocation]);

  if (ticketLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-bold mb-4">Ticket Not Found</h1>
        <button onClick={() => setLocation("/")} className="text-accent underline">Return Home</button>
      </div>
    );
  }

  const handleCompletePurchase = async () => {
    try {
      const result = await buyMutation.mutateAsync(ticket.id);
      setPurchasedTicket(result);
      setIsSuccess(true);
      toast({
        title: "Order Confirmed",
        description: "Your tickets are now available in your account.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center bg-black">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-md w-full glass rounded-[2.5rem] p-10 text-center"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">You're going!</h1>
          <p className="text-white/60 mb-6 leading-relaxed">
            Your purchase for <span className="text-white font-medium">{ticket.title}</span> was successful.
          </p>
          
          {purchasedTicket?.secretContent && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-accent uppercase tracking-widest">
                <Lock className="w-3 h-3" />
                Secure Ticket Data
              </div>
              <p className="text-white font-mono text-sm break-all bg-black/40 p-4 rounded-xl border border-white/5">
                {purchasedTicket.secretContent}
              </p>
              <p className="mt-3 text-[10px] text-white/30 italic">
                Save this information. This unique code/link is your entry to the event.
              </p>
            </div>
          )}

          <button 
            onClick={() => setLocation("/")}
            className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:scale-[1.02] transition-transform"
          >
            Return to Marketplace
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 bg-black">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Checkout Info */}
        <div className="lg:col-span-7 space-y-8">
          <button 
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </button>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Checkout</h1>
                  <p className="text-white/40">Securely purchase your tickets for {ticket.title}</p>
                </div>

                {/* Contact Info */}
                <div className="glass rounded-3xl p-8 border border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <Lock className="w-4 h-4 text-white/60" />
                    </div>
                    Contact Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Methods (Placeholder) */}
                <div className="glass rounded-3xl p-8 border border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <CreditCard className="w-4 h-4 text-white/60" />
                    </div>
                    Payment Method
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-3 p-6 rounded-2xl border-2 border-white/20 bg-white/5 hover:border-white/40 transition-all">
                      <div className="bg-black p-2 rounded-md">
                        <span className="text-white font-bold italic">Pay</span>
                      </div>
                    </button>
                    <button className="flex items-center justify-center gap-3 p-6 rounded-2xl border-2 border-white/10 bg-white/5 hover:border-white/20 transition-all opacity-50 cursor-not-allowed">
                      <CreditCard className="w-5 h-5 text-white/60" />
                      <span className="text-white/60 font-medium">Card</span>
                    </button>
                  </div>
                  <p className="mt-6 text-sm text-white/40 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    Payments are encrypted and secure.
                  </p>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="w-full py-5 rounded-2xl bg-white text-black font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform active:scale-100 shadow-2xl shadow-white/5"
                >
                  Continue to Review
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Review Order</h1>
                  <p className="text-white/40">Almost there! Review your purchase details.</p>
                </div>

                <div className="glass rounded-3xl p-8 border border-white/10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{ticket.title}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(ticket.date), "EEEE, MMMM d • h:mm a")}
                        </div>
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <MapPin className="w-4 h-4" />
                          {ticket.location}
                        </div>
                      </div>
                    </div>
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                      <img src={ticket.imageUrl || ""} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 space-y-3">
                    <div className="flex justify-between text-white/60">
                      <span>1x General Admission</span>
                      <span>{(ticket.price / 100).toFixed(2)}zł</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>Service Fee</span>
                      <span>0.00zł</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-white pt-4">
                      <span>Total</span>
                      <span>{(ticket.price / 100).toFixed(2)}zł</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-5 rounded-2xl glass text-white font-bold hover:bg-white/10 transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleCompletePurchase}
                    disabled={buyMutation.isPending}
                    className="flex-[2] py-5 rounded-2xl bg-white text-black font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform active:scale-100 disabled:opacity-50"
                  >
                    {buyMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Purchase"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Sticky Summary (Optional or layout filler) */}
        <div className="lg:col-span-5 hidden lg:block">
          <div className="sticky top-32 space-y-6">
             <div className="glass rounded-[2rem] overflow-hidden border border-white/10">
               <div className="h-48 overflow-hidden relative">
                 <img src={ticket.imageUrl || ""} className="w-full h-full object-cover opacity-60" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                 <div className="absolute bottom-6 left-6 right-6">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/20 mb-2 inline-block">
                      {ticket.type === 'creator' ? 'Official Event' : 'Market Resale'}
                    </span>
                    <h3 className="text-xl font-bold text-white line-clamp-1">{ticket.title}</h3>
                 </div>
               </div>
               <div className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <TicketIcon className="w-6 h-6 text-white/60" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Ticket Tier</p>
                      <p className="text-white font-medium">Standard Admission</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <p className="text-sm text-white/60 leading-relaxed italic">
                      "This ticket is verified by restage. Our secondary market protection ensures you get a valid ticket or your money back."
                    </p>
                  </div>
               </div>
             </div>

             <div className="flex items-center justify-center gap-6 opacity-40 grayscale grayscale-100">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" className="h-4" alt="PayPal" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-6" alt="Mastercard" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-3" alt="Visa" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
