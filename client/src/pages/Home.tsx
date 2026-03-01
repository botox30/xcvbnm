import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useTickets } from "@/hooks/use-tickets";
import { TicketCard } from "@/components/ui/TicketCard";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  const { data: creatorTickets, isLoading: loadingCreator } = useTickets("creator", "available");
  const { data: marketTickets, isLoading: loadingMarket } = useTickets("market", "available");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        video.muted = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        await video.play();
      } catch (error) {
        console.error("Autoplay was prevented:", error);
      }
    };

    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo);
    }

    const timer = setTimeout(() => setIsVideoVisible(true), 500);
    return () => {
      clearTimeout(timer);
      video.removeEventListener('canplay', playVideo);
    };
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background Video */}
      <div className="fixed inset-0 z-0 bg-black pointer-events-none overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full object-cover opacity-60 transition-opacity duration-1000 ${isVideoVisible ? 'opacity-60' : 'opacity-0'}`}
        >
          <source src="/videos/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden z-10">
        <motion.div 
          style={{ y, opacity }}
          className="text-center px-4 max-w-4xl mx-auto z-10 mt-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-6 text-glow">
              Music,<br/>reimagined.
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-2xl text-white/80 font-light mb-10 max-w-2xl mx-auto"
          >
            Experience the finest concerts. Buy official tickets or find verified resale tickets from the community.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="px-8 py-4 rounded-full bg-white text-black font-medium hover:scale-105 transition-transform duration-300 flex items-center gap-2">
              Explore Events
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link href="/sell" className="px-8 py-4 rounded-full glass text-white font-medium hover:bg-white/10 transition-colors duration-300">
              Sell a Ticket
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
        >
          <span className="text-xs uppercase tracking-widest font-medium">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>

      {/* Main Content Areas */}
      <div className="bg-black/80 backdrop-blur-2xl relative z-10 border-t border-white/10">
        
        {/* Official Tickets */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Official Concerts</h2>
              <p className="text-white/60">Curated experiences straight from the creators.</p>
            </div>
            <Link href="/official" className="hidden sm:flex text-accent hover:text-accent/80 font-medium items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingCreator ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 rounded-3xl glass-card animate-pulse bg-white/5" />
              ))}
            </div>
          ) : creatorTickets?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creatorTickets.slice(0, 3).map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card rounded-3xl">
              <p className="text-white/50">No official tickets currently available.</p>
            </div>
          )}
        </section>

        {/* Market Tickets */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Community Market</h2>
              <p className="text-white/60">Verified fan-to-fan ticket resales.</p>
            </div>
            <Link href="/market" className="hidden sm:flex text-accent hover:text-accent/80 font-medium items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingMarket ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 rounded-3xl glass-card animate-pulse bg-white/5" />
              ))}
            </div>
          ) : marketTickets?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketTickets.slice(0, 3).map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card rounded-3xl">
              <p className="text-white/50">No market tickets currently available.</p>
            </div>
          )}
        </section>

        {/* Professional CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent pointer-events-none" />
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">Ready to sell?</h2>
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Join thousands of fans trading tickets securely. Use our Ticketmaster integration to list your tickets in seconds.
            </p>
            <Link href="/sell">
              <button className="px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-2xl shadow-white/10">
                Start Selling Now
              </button>
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 text-center text-white/40 text-sm">
          <p>© {new Date().getFullYear()} restage. Designed with Apple-like precision.</p>
        </footer>
      </div>
    </div>
  );
}
