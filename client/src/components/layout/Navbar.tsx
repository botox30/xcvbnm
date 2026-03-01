import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Ticket, Search, User, Menu, LogOut, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { user, logoutMutation } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Official", path: "/official" },
    { name: "Market", path: "/market" },
    { name: "Sell", path: "/sell" },
  ];

  if (user?.isAdmin === 1 || user?.username === 'admin') {
    navLinks.push({ name: "Panel", path: "/admin" });
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-4" : "py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-full px-6 py-3 flex items-center justify-between">
          
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black group-hover:scale-105 transition-transform duration-300">
              <Ticket className="w-4 h-4" />
            </div>
            <span className="font-semibold tracking-tight text-lg text-white">restage</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location === link.path 
                    ? "text-white" 
                    : "text-white/60 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
              <Search className="w-5 h-5" />
            </button>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/messages">
                  <button 
                    className={`transition-colors p-2 rounded-full ${
                      location === '/messages'
                        ? 'text-blue-400 bg-blue-500/10'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    title="Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </Link>
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-[10px] text-white/40 leading-none">Logged in as</span>
                  <span className="text-xs font-medium text-white leading-tight">{user.username}</span>
                </div>
                <button 
                  onClick={() => logoutMutation.mutate()}
                  className="text-white/60 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/10"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/auth">
                <button className="text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 hidden sm:block">
                  <User className="w-5 h-5" />
                </button>
              </Link>
            )}
            
            <button className="md:hidden text-white/60 hover:text-white p-2">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
