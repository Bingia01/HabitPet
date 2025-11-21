'use client';

import { Mail } from "lucide-react";
import { SiInstagram, SiTiktok, SiX } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <footer className="bg-[#0A1128] py-12 border-t border-[#7B68C4]/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-playful text-2xl font-bold text-[#8DD4D1] mb-4">
              Forki
            </h3>
            <p className="text-[#B8B8C8] mb-6">
              Making healthy habits effortless, one tap at a time.
            </p>
            <div className="flex gap-4">
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => console.log("Instagram clicked")}
                className="rounded-full"
              >
                <SiInstagram className="w-5 h-5" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => console.log("TikTok clicked")}
                className="rounded-full"
              >
                <SiTiktok className="w-5 h-5" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => console.log("X clicked")}
                className="rounded-full"
              >
                <SiX className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#E8E8F0] mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {["Features", "How It Works", "Pricing", "Community", "Support"].map((link) => (
                <li key={link}>
                  <button 
                    onClick={() => console.log(`Navigate to ${link}`)}
                    className="text-[#B8B8C8] hover:text-[#8DD4D1] transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#E8E8F0] mb-4">Stay Updated</h4>
            <p className="text-[#B8B8C8] mb-4 text-sm">
              Get tips, updates, and exclusive features delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input 
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-full"
              />
              <Button 
                type="submit" 
                size="icon"
                className="rounded-full flex-shrink-0"
              >
                <Mail className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-[#7B68C4]/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#B8B8C8]">
              © 2025 Forki. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a 
                href="/privacy"
                className="text-[#B8B8C8] hover:text-[#8DD4D1] transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms"
                className="text-[#B8B8C8] hover:text-[#8DD4D1] transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

