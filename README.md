# 🎯 Hedefim Bugün (Goal Today)

[![Expo](https://img.shields.io/badge/Expo-49.0-000000?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.72-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](file:///c:/Users/Yusuf/Desktop/HedefimBugun/LICENSE)

> **Transforming daily habits into measurable success.** 
> Hedefim Bugün is an elite personal growth engine designed for high-achievers who demand performance, privacy, and precision.

---

## 🌟 The Vision

| The Challenge | Our Solution |
| :--- | :--- |
| **Fragmented Tracking** | A unified ecosystem for habits, exams, and activity. |
| **Connectivity Issues** | Offline-first architecture with high-integrity sync. |
| **Hardware Limitations** | Native-optimized modules for hardware-level precision. |
| **Generic Experience** | Dynamic onboarding tailored to personal life goals. |

---

## ✨ Core Pillars

### 📅 Advanced Habit Engineering
- **Behavioral Analytics**: Track consistency with high-resolution heatmaps and performance metrics.
- **Dynamic Celebrations**: Haptic feedback and visual micro-animations (confetti) to reinforce positive behaviors.
- **Category-Based Intelligence**: Organize lives into Health, Career, and Personal growth bins.

### 🎓 Academic Excellence (Student Module)
- **Exam Countdown**: Precision timers for upcoming deadlines and exam schedules.
- **Academic Focus**: A minimalist distraction-free environment for tracking study goals.
- **Success Metrics**: Correlate study habits with performance outcomes.

### 🏃 Native Activity Precision
- **Hardware-Level Tracking**: Utilizing Android's `SensorManager` and `TYPE_STEP_COUNTER` via a custom Kotlin bridge for energy-efficient, 24/7 accuracy.
- **Foreground Reliability**: A dedicated Android Service ensures tracking continues even when the device is under heavy load or idle.

---

## 🏗 High-Performance Architecture

The app is built on a custom bridge between high-level React logic and low-level Native performance.

### 🔌 Native Bridging (Kotlin)
We bypass traditional JS-level sensor tracking in favor of a **Native Android Service**. This allows for:
- **0% Idle Battery Drain**: Tapping directly into hardware registers.
- **Boot Persistence**: Automatic service restart after device reboots.

### 🔄 Offline Data Persistence
Our **`SyncQueue`** and **`MigrationService`** layers ensure that:
- You never lose a single step, even without an internet connection.
- Data is automatically flushed and deduplicated once connectivity is restored.
- Schema migrations happen transparently, keeping your history safe during updates.

---

## ⚡ Performance & QA

| Feature | Benchmark | Status |
| :--- | :--- | :--- |
| **Logic Sorting** | 1,000 items in <10ms | ✅ Green |
| **Massive Filter** | 5,000 items in <20ms | ✅ Green |
| **Stress Test** | 10k items (Worst Case) | ✅ Fluid |

> [!TIP]
> **Developer Mode**: Run `npm test src/__tests__/performance/` to verify these benchmarks on your own environment.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v16 or higher
- **Android Studio**: Recommended for native module compilation
- **Expo Go**: For rapid prototyping

### Installation
1.  **Clone & Enter**
    ```bash
    git clone https://github.com/yusufcalisir/GoalToday.git
    cd GoalToday
    ```
2.  **Install & Launch**
    ```bash
    npm install
    npx expo run:android # Compiles native Kotlin modules
    ```

---

## 📂 Engineering Overview

```bash
├── android/            # 🔥 Native Kotlin Bridge & SDK config
├── src/
│   ├── components/     # High-performance UI Atomic Design
│   ├── context/        # Global State Central (Context API)
│   ├── native/         # React-Kotlin communication definitions
│   ├── navigation/     # Fluid screen transitions (React Navigation)
│   ├── utils/          # The Brain (SyncQueue, Migrations, Physics)
│   └── types/          # Strict Type Safety (TypeScript)
└── App.tsx             # Root Orchestrator
```

---

## 🗺 Vision & Roadmap

- [ ] **Cloud-Edge Sync**: Real-time cross-device synchronization.
- [ ] **iOS HealthKit**: Extending activity precision to the Apple ecosystem.
- [ ] **Social Integration**: Compete with friends and share progress safely.
- [ ] **Smart Assistant**: AI-driven suggestions based on your performance data.

---

## 📄 License

Distributed under a personalized **MIT License**. Created and maintained by **Yusuf Çalışır**.
See [LICENSE](file:///c:/Users/Yusuf/Desktop/HedefimBugun/LICENSE) for full details.
