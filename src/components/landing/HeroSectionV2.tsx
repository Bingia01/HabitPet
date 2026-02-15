'use client';

import { ArrowRight, Download, Sparkles, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useRouter } from "next/navigation";

export default function HeroSectionV2() {
  const router = useRouter();

  const handleWebAppClick = () => {
    router.push('/onboarding');
  };

  const handleAppStoreClick = () => {
    alert("Coming soon to App Store!");
  };

  // Floating animation for decorative elements
  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  // Mascot bounce animation (Tamagotchi-inspired)
  const mascotAnimation = {
    scale: [1, 1.05, 1],
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  // Text entrance animations (Nintendo-inspired)
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-[#0A1128] via-[#1A2332] to-[#2A3441] flex items-center">
      {/* Animated background pattern - Forki theme glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#8DD4D1] rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#7B68C4] rounded-full blur-3xl opacity-30" />
      </div>

      {/* Floating decorative elements (Nintendo-inspired) */}
      <motion.div
        animate={floatingAnimation}
        className="absolute top-16 left-8 text-3xl opacity-20"
      >
        🍎
      </motion.div>
      <motion.div
        animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.5 } }}
        className="absolute top-32 right-16 text-3xl opacity-20"
      >
        🥗
      </motion.div>
      <motion.div
        animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }}
        className="absolute bottom-32 left-16 text-3xl opacity-20"
      >
        🥑
      </motion.div>
      <motion.div
        animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1.5 } }}
        className="absolute bottom-16 right-32 text-3xl opacity-20"
      >
        🍓
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left column - Text content */}
          <div className="text-[#E8E8F0] space-y-4">
            {/* Badge - Forki theme */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={textVariants}
              className="inline-flex items-center gap-2 bg-[#1E2742]/80 backdrop-blur-md px-3 py-1.5 rounded-full border-2 border-[#7B68C4]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8DD4D1]" />
              <span className="text-xs font-semibold text-[#E8E8F0]">Join 10,000+ Happy Users</span>
            </motion.div>

            {/* Main headline - Forki brand */}
            <motion.h1
              initial="hidden"
              animate="visible"
              custom={1}
              variants={textVariants}
              className="font-playful text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#E8E8F0]"
            >
              Your Forki,
              <br />
              <span className="text-[#8DD4D1]">Your Journey</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial="hidden"
              animate="visible"
              custom={2}
              variants={textVariants}
              className="text-lg md:text-xl font-medium text-[#B8B8C8] max-w-xl"
            >
              Log meals in{" "}
              <span className="font-bold text-[#8DD4D1] bg-[#1E2742]/60 px-2 py-1 rounded border border-[#7B68C4]/30">
                15 seconds
              </span>
              . Watch your Forki thrive. Build habits that stick.
            </motion.p>

            {/* CTA Buttons - Forki theme colors */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={textVariants}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                size="lg"
                onClick={handleWebAppClick}
                className="rounded-full px-6 py-5 text-lg font-bold bg-[#8DD4D1] text-[#0A1128] hover:bg-[#6FB8B5] shadow-2xl hover:shadow-[#8DD4D1]/50 transition-all hover:scale-105 group"
              >
                <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Start Your Journey
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleAppStoreClick}
                className="rounded-full px-6 py-5 text-lg font-bold bg-[#1E2742]/60 backdrop-blur-md border-2 border-[#7B68C4] text-[#E8E8F0] hover:bg-[#7B68C4] hover:text-[#E8E8F0] transition-all hover:scale-105"
              >
                <Download className="mr-2 w-4 h-4" />
                Get the App
              </Button>
            </motion.div>

            {/* Stats row - Forki theme */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={4}
              variants={textVariants}
              className="flex flex-wrap gap-6 pt-4"
            >
              <div className="text-center">
                <div className="font-playful text-3xl md:text-4xl font-bold text-[#8DD4D1]">
                  <CountUp end={15} duration={2} suffix=" sec" />
                </div>
                <div className="text-xs md:text-sm text-[#B8B8C8] mt-1">to log a meal</div>
              </div>
              <div className="h-12 w-px bg-[#7B68C4]/30" />
              <div className="text-center">
                <div className="font-playful text-3xl md:text-4xl font-bold text-[#8DD4D1]">
                  <CountUp end={1} duration={2} />
                  -tap
                </div>
                <div className="text-xs md:text-sm text-[#B8B8C8] mt-1">no typing</div>
              </div>
              <div className="h-12 w-px bg-[#7B68C4]/30" />
              <div className="text-center">
                <div className="font-playful text-3xl md:text-4xl font-bold text-[#8DD4D1]">
                  <CountUp end={10} duration={2} suffix="K+" />
                </div>
                <div className="text-xs md:text-sm text-[#B8B8C8] mt-1">active users</div>
              </div>
            </motion.div>

            {/* Trust signals - Forki theme */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={5}
              variants={textVariants}
              className="flex flex-wrap items-center gap-3 text-xs text-[#B8B8C8]"
            >
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-[#F5C9E0]" />
                <span>Free forever</span>
              </div>
              <span className="text-[#7B68C4]">•</span>
              <div>No credit card required</div>
              <span className="text-[#7B68C4]">•</span>
              <div>Start in 30 seconds</div>
            </motion.div>
          </div>

          {/* Right column - Interactive mascot - Forki theme */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative"
          >
            {/* Glow effect behind mascot - Forki mint glow */}
            <div className="absolute inset-0 bg-[#8DD4D1]/20 rounded-full blur-3xl" />

            {/* Interactive mascot container - Forki theme panel */}
            <motion.div
              animate={mascotAnimation}
              className="relative bg-[#1E2742]/85 backdrop-blur-lg rounded-2xl p-6 border-2 border-[#7B68C4] shadow-2xl shadow-[#7B68C4]/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <video
                src="/mascots/Forki_intro.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto rounded-lg"
              />
            </motion.div>

            {/* Floating badges around mascot - Forki theme colors */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-6 -right-6 bg-[#F5C9E0] text-[#0A1128] rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-xl border-2 border-[#7B68C4]"
            >
              <span className="text-xl font-bold">92%</span>
              <span className="text-[9px] font-semibold">Streak Rate</span>
            </motion.div>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-6 -left-6 bg-[#7B68C4] text-[#E8E8F0] rounded-full w-14 h-14 flex flex-col items-center justify-center shadow-xl border-2 border-[#8DD4D1]"
            >
              <span className="text-lg">🏆</span>
              <span className="text-[8px] font-semibold">Top Rated</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator - Forki theme */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[#B8B8C8] text-center"
      >
        <div className="text-xs font-medium mb-1">Scroll to explore</div>
        <div className="w-5 h-8 border-2 border-[#7B68C4]/60 rounded-full mx-auto flex items-start justify-center p-1.5">
          <div className="w-1 h-1 bg-[#8DD4D1] rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

