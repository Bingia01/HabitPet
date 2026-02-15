# Forki

A gamified nutrition tracking iOS app that pairs you with a virtual pet companion. Log your meals, hit your calorie goals, and watch your pet thrive.

## What is Forki?

Forki turns healthy eating into a game. You adopt a virtual pet — choose from characters like Avo Friend, Boba Buddy, or Berry Sweet — and your pet's mood and appearance reflect how well you're eating. Stay on track and your pet is happy; skip meals or overeat and it shows.

The app combines real nutritional data from the USDA FoodData Central database with an AI-powered camera that can detect food and estimate calories from a photo.

## Who is it for?

- Health-conscious individuals looking for a fun way to track nutrition
- People who want calorie and macro tracking without the tedium
- Anyone who's tried traditional food logging apps and lost motivation

## Features

### Virtual Pet Companion
- 6 unique characters to choose from, each with their own personality
- Pet mood changes in real time based on your daily nutrition progress
- States range from sad (under 30% of goal) to strong (90-110%) to overfed (over 110%)

### AI Camera
- Take a photo of your food to automatically detect items and estimate calories
- Powered by OpenAI Vision (GPT-4o-mini)
- Advanced LiDAR-based 3D volume estimation on supported devices (iPhone 12 Pro+)
- Three detection paths: nutrition label OCR, restaurant menu recognition, and geometric volume analysis

### Nutrition Tracking
- Search 300,000+ foods from the USDA FoodData Central database
- Track calories, protein, carbs, and fats
- Daily progress visualization with goal tracking
- Historical food logging with timestamps

### Onboarding
- Guided setup: biometrics, dietary preferences, calorie goals
- Character selection with preview
- Notification opt-in for habit reminders

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | SwiftUI (iOS 17+) |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| AI | OpenAI Vision API (GPT-4o-mini) |
| Food Data | USDA FoodData Central API |
| Camera | CalorieCameraKit (custom Swift package) |
| Depth | LiDAR + ARKit for 3D volume estimation |

## Project Structure

```
HabitPet/                    # Main iOS app source
  HabitPetApp.swift          # App entry point
  HabitPetFlow.swift         # Navigation router
  HomeScreen.swift           # Dashboard with pet + nutrition progress
  FoodLoggerView.swift       # Food search and logging
  AICameraView.swift         # Camera capture with OpenAI
  CalorieCameraBridge.swift  # CalorieCameraKit integration
  Models.swift               # Core data models
  NutritionState.swift       # Reactive state management
  USDAFoodService.swift      # USDA API client with caching

CalorieCameraKit-v1.0.0/     # Camera + AI Swift package
  CaptureKit/                # Photo capture + depth data
  PerceptionKit/             # Food segmentation + volume estimation
  NutritionKit/              # API integration
  UXKit/                     # Camera UI components

calorie-camera/              # Swift package (development version)
calorie-camera-demo/         # Demo app for CalorieCameraKit
supabase/                    # Edge functions + database config
```

## Getting Started

### Prerequisites
- Xcode 15+ with iOS 17 SDK
- An Apple Developer account (for device testing)
- Supabase project with Edge Functions deployed
- OpenAI API key (for camera AI features)
- USDA API key (for food search)

### Build & Run
1. Open `HabitPet.xcodeproj` in Xcode
2. Copy `.env.local.example` to `.env.local` and fill in your API keys
3. Select a simulator or connected device
4. Build and run (Cmd+R)

> LiDAR-based camera features require a physical device with LiDAR (iPhone 12 Pro or later).

## Other Branches

| Branch | Description |
|--------|-------------|
| `website` | Next.js/TypeScript landing page for the app |
| `feature/food-logging-supabase` | Full-stack development branch with Supabase integration, tests, and additional features |

## License

See [LICENSE](LICENSE) for details.
