# 🎯 Hedefim Bugün (Goal Today)

[![Expo](https://img.shields.io/badge/Expo-49.0-000000?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.72-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Hedefim Bugün** is a high-performance, modern personal growth application designed to help users track habits, manage exam schedules, and monitor physical activity. Built with a focus on native performance and smooth user experience.

---

## ✨ Key Features

### 📅 Habit Tracking
- **Create & Manage**: Effortlessly set up daily or weekly habits.
- **Visual Feedback**: Confetti celebrations and smooth animations upon task completion.
- **Analytics**: Detailed statistics and consistency heatmaps to track your progress.

### 🎓 Student Ecosystem
- **Exam Tracker**: A dedicated module for students to monitor upcoming exams and deadlines.
- **Focus Goals**: Smart reminders tailored for academic success.

### 🏃 Native Step Counter
- **Hardware Integration**: Custom Android implementation using `SensorManager` for high accuracy.
- **Battery Efficient**: Low-impact background tracking.
- **Adaptive Goals**: Dynamic daily targets based on your activity profile.

### 🛠 Architecture & Performance
- **Native Modules**: Specialized Kotlin bridging for hardware sensors.
- **Smart Onboarding**: Dynamic experience tailored to user-specific goals.
- **Offline First**: Robust `SyncQueue` ensures data integrity even without internet.
- **Reliability**: Global Error Boundaries and crash reporting (Flipper integration).

---

## 🚀 Tech Stack

- **Frontend**: React Native (Expo SDK 49)
- **Language**: TypeScript
- **Native Bridging**: Kotlin
- **Navigation**: React Navigation (Native Stack & Bottom Tabs)
- **Icons**: Lucide React Native
- **Storage**: AsyncStorage with custom migration layer
- **Styling**: Vanilla CSS-in-JS + Dynamic Themes

---

## 🛠 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) (for native builds)

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yusufcalisir/GoalToday.git
   cd GoalToday
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Expo**:
   ```bash
   npx expo start
   ```

4. **Build Android**:
   ```bash
   npx expo run:android
   ```

---

## 📂 Project Structure

```text
├── android/            # Native Android project configuration
├── assets/             # Images, icons, and fonts
├── src/
│   ├── components/     # Reusable UI elements
│   ├── context/        # State management (HabitContext)
│   ├── native/         # Native module bridge definitions
│   ├── navigation/     # Navigation structure
│   ├── screens/        # Main application screens
│   ├── utils/          # Helpers (Sync, Migrations, Sensors)
│   └── types/          # TypeScript definitions
└── App.tsx             # Application entry point
```

---

## ⚡ Performance Testing

The application includes a built-in performance monitoring and benchmarking suite to ensure a "High-Performance" user experience.

### 📊 Monitoring Tools
- **Render Profiling**: Automated logging of component render durations via `PerformanceMonitor`.
- **Execution Benchmarks**: Utilities in `src/utils/performance.ts` to track hardware and logic speed.
- **Low-End Simulation**: Stress tests to ensure fluidity for users on legacy or entry-level devices.
- **Automated Thresholds**: Performance tests that fail if critical operations (sorting/filtering) exceed frame-budget limits.


### 🧪 Running Performance Tests
```bash
npm test src/__tests__/performance/
```

---

## 🤝 Contributing

Contributions are welcome! 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

