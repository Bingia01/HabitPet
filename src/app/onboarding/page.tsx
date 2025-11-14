'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DIETARY_PREFERENCES, FOOD_PREFERENCES } from '@/lib/constants';
import { DietaryPreference, FoodPreference, NutritionGoal } from '@/types';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/contexts/DemoContext';
import { DEFAULT_DAILY_CALORIES, DEFAULT_WEEKLY_CALORIES } from '@/lib/constants';

type OnboardingStep = 'intro' | 'signup' | 'biometrics' | 'dietary' | 'food-preferences';

interface OnboardingData {
  name: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  dietaryPreferences: DietaryPreference[];
  foodPreferences: FoodPreference[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useDemo();
  const [step, setStep] = useState<OnboardingStep>('intro');
  const [data, setData] = useState<OnboardingData>({
    name: '',
    email: '',
    age: 0,
    height: 0,
    weight: 0,
    dietaryPreferences: [],
    foodPreferences: [],
  });

  const handleNext = () => {
    const stepOrder: OnboardingStep[] = ['intro', 'signup', 'biometrics', 'dietary', 'food-preferences'];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1]);
    } else {
      // Complete onboarding with demo data
      const userData = {
        name: data.name,
        email: data.email,
        age: data.age,
        height: data.height,
        weight: data.weight,
      };

      const preferencesData = {
        dietary_preferences: data.dietaryPreferences,
        food_preferences: data.foodPreferences,
        daily_calorie_goal: DEFAULT_DAILY_CALORIES,
        weekly_calorie_goal: DEFAULT_WEEKLY_CALORIES,
        nutrition_goals: ['high-protein', 'more-veggies'] as NutritionGoal[],
      };

      completeOnboarding(userData, preferencesData);
      router.push('/dashboard');
    }
  };

  const toggleDietaryPreference = (preference: DietaryPreference) => {
    setData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter(p => p !== preference)
        : [...prev.dietaryPreferences, preference]
    }));
  };

  const toggleFoodPreference = (preference: FoodPreference) => {
    setData(prev => ({
      ...prev,
      foodPreferences: prev.foodPreferences.includes(preference)
        ? prev.foodPreferences.filter(p => p !== preference)
        : [...prev.foodPreferences, preference]
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🐾</div>
              <CardTitle className="text-2xl text-teal-600">Meet Your Forki!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-lg text-gray-700">
                &ldquo;I want to eat healthier. Let&apos;s do it together!&rdquo;
              </p>
              <p className="text-sm text-gray-500">
                Your virtual pet will grow and evolve as you build healthy eating habits!
              </p>
              <Button
                onClick={handleNext}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white text-lg py-6"
                size="lg"
              >
                Let&apos;s Get Started!
              </Button>
            </CardContent>
          </Card>
        );

      case 'signup':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-xl text-center">Tell us about yourself</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  placeholder="Your name"
                  value={data.name}
                  onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={data.email}
                  onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <Button
                onClick={handleNext}
                disabled={!data.name || !data.email}
                className="w-full"
                size="lg"
              >
                Continue →
              </Button>
            </CardContent>
          </Card>
        );

      case 'biometrics':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-xl text-center">Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <Input
                  type="number"
                  placeholder="25"
                  value={data.age || ''}
                  onChange={(e) => setData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Height (cm)</label>
                <Input
                  type="number"
                  placeholder="170"
                  value={data.height || ''}
                  onChange={(e) => setData(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                <Input
                  type="number"
                  placeholder="70"
                  value={data.weight || ''}
                  onChange={(e) => setData(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <Button
                onClick={handleNext}
                disabled={!data.age || !data.height || !data.weight}
                className="w-full"
                size="lg"
              >
                Next →
              </Button>
            </CardContent>
          </Card>
        );

      case 'dietary':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-xl text-center">Dietary Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {DIETARY_PREFERENCES.map((pref) => (
                  <Button
                    key={pref.value}
                    variant={data.dietaryPreferences.includes(pref.value) ? "default" : "outline"}
                    onClick={() => toggleDietaryPreference(pref.value)}
                    className="w-full justify-start"
                  >
                    {pref.label}
                  </Button>
                ))}
              </div>
              <Button
                onClick={handleNext}
                className="w-full mt-6"
                size="lg"
              >
                Next →
              </Button>
            </CardContent>
          </Card>
        );

      case 'food-preferences':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-xl text-center">Food Preferences</CardTitle>
              <p className="text-sm text-gray-500 text-center">Select foods you enjoy eating</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {FOOD_PREFERENCES.map((food) => (
                  <Button
                    key={food.emoji}
                    variant={data.foodPreferences.includes(food.emoji) ? "default" : "outline"}
                    onClick={() => toggleFoodPreference(food.emoji)}
                    className="aspect-square flex flex-col gap-1 p-2"
                  >
                    <span className="text-2xl">{food.emoji}</span>
                    <span className="text-xs">{food.label}</span>
                  </Button>
                ))}
              </div>
              <Button
                onClick={handleNext}
                className="w-full mt-6 bg-teal-500 hover:bg-teal-600"
                size="lg"
              >
                Done! Start Journey 🎉
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100 flex items-center justify-center p-4">
      {renderStep()}
    </div>
  );
}