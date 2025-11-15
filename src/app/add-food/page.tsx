'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Edit3, ArrowLeft, Loader2 } from 'lucide-react';
import { FOOD_PREFERENCES, PORTION_SIZES } from '@/lib/constants';
import { FoodPreference } from '@/types';
import { useDemo } from '@/contexts/DemoContext';
import { usePet } from '@/contexts/PetContext';

const ImprovedCameraCapture = dynamic(
  () => import('@/components/ImprovedCameraCapture').then(mod => ({ default: mod.ImprovedCameraCapture })),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <Card className="w-80">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
            <h3 className="text-lg font-semibold mb-2">Loading Camera</h3>
            <p className="text-gray-600">
              Preparing camera interface...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
);

type AddFoodStep = 'method' | 'camera' | 'manual' | 'portion' | 'confirm';

interface FoodData {
  emoji: string;
  name: string;
  calories: number;
  portion: string;
  portionMultiplier: number;
}

export default function AddFoodPage() {
  const router = useRouter();
  const { addFoodLog } = useDemo();
  const { feedPet, updateMood } = usePet();
  const [step, setStep] = useState<AddFoodStep>('method');
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [foodData, setFoodData] = useState<FoodData>({
    emoji: '',
    name: '',
    calories: 0,
    portion: '',
    portionMultiplier: 1,
  });

  // Handle food submission from camera
  const handleFoodSubmission = async (foodAnalysis: { foodType: string; calories: number; weight: number; emoji?: string; macros?: { proteinG: number; carbsG: number; fatG: number; fiberG?: number } }) => {
    setIsAnalyzing(true);
    
    try {
      // Convert the food analysis to our food data format
      setFoodData(prev => ({
        ...prev,
        emoji: foodAnalysis.emoji || '🍽️',
        name: foodAnalysis.foodType,
        calories: foodAnalysis.calories,
        portion: 'Standard serving',
        portionMultiplier: 1,
      }));
      
      // Close camera and show confirmation
      setShowCamera(false);
      setStep('confirm');
    } catch (error) {
      console.error('Food submission failed:', error);
      setStep('manual');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectFood = (food: FoodPreference) => {
    const foodInfo = FOOD_PREFERENCES.find(f => f.emoji === food);
    if (foodInfo) {
      setFoodData(prev => ({
        ...prev,
        emoji: food,
        name: foodInfo.label,
        calories: foodInfo.calories_per_100g,
      }));
      setStep('portion');
    }
  };

  const selectPortion = (portionValue: string) => {
    const portion = PORTION_SIZES.find(p => p.value === portionValue);
    if (portion) {
      setFoodData(prev => ({
        ...prev,
        portion: portion.label,
        portionMultiplier: portion.multiplier,
      }));
      setStep('confirm');
    }
  };

  const confirmLog = () => {
    const totalCalories = Math.round(foodData.calories * foodData.portionMultiplier);

    // Add food log to demo state
    addFoodLog({
      food_type: foodData.name,
      ingredients: [foodData.name.toLowerCase()],
      portion_size: foodData.portion,
      calories: totalCalories,
      emoji: foodData.emoji,
      logged_at: new Date().toISOString(),
    });

    // Feed the pet and make it happy!
    feedPet(totalCalories);
    updateMood('excited');

    // Redirect to main page with success message
    router.push('/?logged=true');
  };

  const goBack = () => {
    const stepOrder: AddFoodStep[] = ['method', 'camera', 'manual', 'portion', 'confirm'];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    } else {
      router.push('/');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'method':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">How would you like to log your food?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setStep('camera')}
                  className="w-full h-20 text-lg flex flex-col gap-2"
                  variant="outline"
                >
                  <Camera className="w-8 h-8" />
                  Take Photo
                </Button>
                <Button
                  onClick={() => setStep('manual')}
                  className="w-full h-20 text-lg flex flex-col gap-2"
                  variant="outline"
                >
                  <Edit3 className="w-8 h-8" />
                  Manual Input
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'camera':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Scan Your Food</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="w-full h-64 bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                <Camera className="w-16 h-16 text-white" />
                <div className="absolute inset-4 border-2 border-white/50 rounded-lg"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-green-400 rounded"></div>
              </div>
              <p className="text-sm text-gray-600">
                Point your camera at food to automatically detect calories and nutrition
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => setShowCamera(true)} 
                  className="w-full"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Open Camera
                </Button>
                <Button 
                  onClick={() => setStep('manual')} 
                  variant="outline"
                  className="w-full"
                >
                  Enter Manually
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'manual':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Choose Your Food</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {FOOD_PREFERENCES.map((food) => (
                  <Button
                    key={food.emoji}
                    variant="outline"
                    onClick={() => selectFood(food.emoji)}
                    className="aspect-square flex flex-col gap-1 p-2 hover:bg-teal-50"
                  >
                    <span className="text-3xl">{food.emoji}</span>
                    <span className="text-xs">{food.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'portion':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <span className="text-3xl">{foodData.emoji}</span>
                {foodData.name}
              </CardTitle>
              <p className="text-center text-sm text-gray-500">Select portion size</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {PORTION_SIZES.map((portion) => (
                <Button
                  key={portion.value}
                  variant="outline"
                  onClick={() => selectPortion(portion.value)}
                  className="w-full justify-between p-4"
                >
                  <span>{portion.label}</span>
                  <span className="text-sm text-gray-500">
                    ~{Math.round(foodData.calories * portion.multiplier)} cal
                  </span>
                </Button>
              ))}
            </CardContent>
          </Card>
        );

      case 'confirm':
        const totalCalories = Math.round(foodData.calories * foodData.portionMultiplier);
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Confirm Your Log</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-6xl">{foodData.emoji}</div>
              <div>
                <h3 className="text-xl font-semibold">{foodData.name}</h3>
                <p className="text-gray-500">{foodData.portion} portion</p>
                <p className="text-2xl font-bold text-teal-600">{totalCalories} calories</p>
              </div>
              <Button
                onClick={confirmLog}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                size="lg"
              >
                Log Food! 🎉
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-teal-600">Add Food</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4">
        {renderStep()}
      </div>

      {/* Camera Component */}
      {showCamera && (
        <ImprovedCameraCapture
          onCapture={handleFoodSubmission}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* AI Analysis Loading */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-80">
            <CardContent className="p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
              <h3 className="text-lg font-semibold mb-2">Analyzing Food</h3>
              <p className="text-gray-600">
                AI is identifying your food and calculating calories...
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
