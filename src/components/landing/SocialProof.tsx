'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export default function SocialProof() {
  const testimonials = [
    {
      name: "Emma Chen",
      university: "USC",
      initials: "EC",
      quote: "Finally, a tracker that doesn't feel like homework! My Forki makes it actually fun.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      university: "UCLA",
      initials: "MJ",
      quote: "I've tried other trackers. Forki is the only one I've stuck with for months.",
      rating: 5
    },
    {
      name: "Priya Patel",
      university: "Berkeley",
      initials: "PP",
      quote: "The camera feature is a game changer. No more searching through endless food databases!",
      rating: 5
    }
  ];

  const stats = [
    { value: "10,000+", label: "Active Users" },
    { value: "500K+", label: "Meals Logged" },
    { value: "92%", label: "Streak Retention" },
    { value: "4.9★", label: "App Rating" }
  ];

  return (
    <section className="py-24 bg-[#0A1128]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playful text-4xl md:text-5xl lg:text-6xl font-bold text-[#E8E8F0] mb-6">
            Loved by Users Everywhere
          </h2>
          <p className="text-lg md:text-xl text-[#B8B8C8] max-w-2xl mx-auto">
            Join thousands building healthier habits with Forki.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 bg-[#1E2742]/85 rounded-3xl border-2 border-[#7B68C4]/30"
            >
              <div className="text-3xl md:text-4xl font-bold text-[#8DD4D1] mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-[#B8B8C8]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="border-[#7B68C4]/30 bg-[#1E2742]/85"
            >
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#8DD4D1] text-[#8DD4D1]" />
                  ))}
                </div>
                <p className="text-base text-[#E8E8F0] mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-[#8DD4D1]/20 text-[#8DD4D1] font-semibold border border-[#7B68C4]/30">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-[#E8E8F0]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-[#B8B8C8]">
                      {testimonial.university}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

