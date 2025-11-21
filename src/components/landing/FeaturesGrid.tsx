'use client';

import { Smartphone, Camera, Trophy, TrendingUp, Share2, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function FeaturesGrid() {
  const features = [
    {
      icon: Smartphone,
      title: "1-Tap Logging",
      description: "No typing, no searching databases. Just one tap to log your meal and move on with your day."
    },
    {
      icon: Camera,
      title: "AI Camera Recognition",
      description: "Snap a photo and let AI identify your food with LiDAR-enhanced portion detection."
    },
    {
      icon: Trophy,
      title: "Streak Rewards",
      description: "Build momentum with visual streak counters, confetti animations, and motivational nudges."
    },
    {
      icon: TrendingUp,
      title: "Weekly Insights",
      description: "Get simple, actionable insights about your progress with beautiful weekly recaps."
    },
    {
      icon: Share2,
      title: "Social Sharing",
      description: "Share your pet's growth and celebrate milestones with friends and community."
    },
    {
      icon: Palette,
      title: "Pet Customization",
      description: "Unlock adorable skins, seasonal effects, and cosmetics as you build healthy habits."
    }
  ];

  return (
    <section className="py-24 bg-[#0A1128]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playful text-4xl md:text-5xl lg:text-6xl font-bold text-[#E8E8F0] mb-6">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg md:text-xl text-[#B8B8C8] max-w-2xl mx-auto">
            Designed for busy users who want results without the hassle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="hover:shadow-lg transition-all cursor-default border-[#7B68C4]/30 bg-[#1E2742]/85 hover:border-[#7B68C4]"
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#8DD4D1]/20 flex items-center justify-center mb-6 border border-[#7B68C4]/30">
                  <feature.icon className="w-8 h-8 text-[#8DD4D1]" />
                </div>
                <h3 className="text-xl font-semibold text-[#E8E8F0] mb-3">
                  {feature.title}
                </h3>
                <p className="text-base text-[#B8B8C8] leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

