'use client';

import { ArrowRight, Download, Sparkles, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HeroSectionV2() {
  const router = useRouter();
  const [mascotState, setMascotState] = useState<"happy" | "motivated">("happy");

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
      ease: "easeInOut",
    },
  };

  // Mascot bounce animation (Tamagotchi-inspired)
  const mascotAnimation = {
    scale: [1, 1.05, 1],
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
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
        ease: "easeOut",
      },
    }),
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-[#4ECDC4] via-[#44A08D] to-[#6B7FFF] flex items-center">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
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
          <div className="text-white space-y-4">
            {/* Badge (MyFitnessPal-inspired trust signal) */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={textVariants}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border-2 border-white/40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Join 10,000+ Happy Students</span>
            </motion.div>

            {/* Main headline (Nintendo-inspired bold typography) */}
            <motion.h1
              initial="hidden"
              animate="visible"
              custom={1}
              variants={textVariants}
              className="font-playful text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            >
              Your Pet,
              <br />
              <span className="text-yellow-300">Your Progress</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial="hidden"
              animate="visible"
              custom={2}
              variants={textVariants}
              className="text-lg md:text-xl font-medium text-white/95 max-w-xl"
            >
              Track meals in{" "}
              <span className="font-bold text-yellow-300 bg-white/20 px-2 py-1 rounded">
                15 seconds
              </span>
              . Watch your adorable Forki grow. Build streaks that actually stick.
            </motion.p>

            {/* CTA Buttons (MyFitnessPal-inspired conversion focus) */}
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
                className="rounded-full px-6 py-5 text-lg font-bold bg-yellow-400 text-gray-900 hover:bg-yellow-300 shadow-2xl hover:shadow-yellow-400/50 transition-all hover:scale-105 group"
              >
                <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Try Free Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleAppStoreClick}
                className="rounded-full px-6 py-5 text-lg font-bold bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all hover:scale-105"
              >
                <Download className="mr-2 w-4 h-4" />
                Get the App
              </Button>
            </motion.div>

            {/* Stats row (Nintendo + MyFitnessPal inspired) */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={4}
              variants={textVariants}
              className="flex flex-wrap gap-6 pt-4"
            >
              <div className="text-center">
                <div className="font-playful text-3xl md:text-4xl font-bold text-yellow-300">
                  <CountUp end={15} duration={2} suffix=" sec" />
                </div>
                <div className="text-xs md:text-sm text-white/80 mt-1">to log a meal</div>
              </div>
              <div className="h-12 w-px bg-white/30" />
              <div className="text-center">
                <div className="font-playful text-3xl md:text-4xl font-bold text-yellow-300">
                  <CountUp end={1} duration={2} />
                  -tap
                </div>
                <div className="text-xs md:text-sm text-white/80 mt-1">no typing</div>
              </div>
              <div className="h-12 w-px bg-white/30" />
              <div className="text-center">
                <div className="font-playful text-3xl md:text-4xl font-bold text-yellow-300">
                  <CountUp end={10} duration={2} suffix="K+" />
                </div>
                <div className="text-xs md:text-sm text-white/80 mt-1">happy students</div>
              </div>
            </motion.div>

            {/* Trust signals (MyFitnessPal-inspired) */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={5}
              variants={textVariants}
              className="flex flex-wrap items-center gap-3 text-xs text-white/70"
            >
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-pink-300" />
                <span>Free forever</span>
              </div>
              <span>•</span>
              <div>No credit card required</div>
              <span>•</span>
              <div>Takes 30 seconds to start</div>
            </motion.div>
          </div>

          {/* Right column - Interactive mascot (Tamagotchi-inspired) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative"
          >
            {/* Glow effect behind mascot */}
            <div className="absolute inset-0 bg-yellow-300/30 rounded-full blur-3xl" />

            {/* Interactive mascot container */}
            <motion.div
              animate={mascotAnimation}
              className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/30 shadow-2xl cursor-pointer"
              onHoverStart={() => setMascotState("motivated")}
              onHoverEnd={() => setMascotState("happy")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={mascotState === "happy" ? "/mascots/Happy_mascot_celebration_state_adc287c7.png" : "/mascots/Motivated_mascot_energy_state_717dc3ff.png"}
                alt="Forki mascot"
                width={400}
                height={400}
                className="w-full h-auto transition-all duration-500"
              />

              {/* Mascot state indicator */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    mascotState === "happy" ? "bg-green-500 animate-pulse" : "bg-orange-500 animate-pulse"
                  }`}
                />
                <span className="text-xs font-bold text-gray-900">
                  {mascotState === "happy" ? "Happy" : "Motivated"}
                </span>
              </div>

              {/* Hover instruction */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                Hover to see me energized!
              </div>
            </motion.div>

            {/* Floating badges around mascot (Nintendo-inspired) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-6 -right-6 bg-pink-400 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-xl"
            >
              <span className="text-xl font-bold">92%</span>
              <span className="text-[9px] font-semibold">Streak Rate</span>
            </motion.div>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-6 -left-6 bg-purple-400 text-white rounded-full w-14 h-14 flex flex-col items-center justify-center shadow-xl"
            >
              <span className="text-lg">🏆</span>
              <span className="text-[8px] font-semibold">Top Rated</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator (Nintendo-inspired) */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-center"
      >
        <div className="text-xs font-medium mb-1">Scroll to explore</div>
        <div className="w-5 h-8 border-2 border-white/60 rounded-full mx-auto flex items-start justify-center p-1.5">
          <div className="w-1 h-1 bg-white/60 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

