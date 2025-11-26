# WakeStop

WakeStop is a smart location-based alarm application designed to help you never miss your stop again. It tracks your location in real-time and wakes you up when you are approaching your destination.

## Features

- **📍 Real-time Location Tracking**: Monitors your position using your device's GPS.
- **🔍 Smart Destination Search**: Search for your destination with autocomplete suggestions powered by OpenStreetMap.
- **⏰ Intelligent Alarm**: Set an alarm to trigger a specific number of minutes before arrival.
- **🔔 Audio & Vibration**: Alerts you with sound and vibration when you are close.
- **🔋 Battery Efficient**: Optimized to check location periodically to save battery.

## Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: React Hooks
- **Maps/Geocoding**: OpenStreetMap (Nominatim API)
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:8080](http://localhost:8080) in your browser.

## Testing

Run the test suite with:

```bash
npm test
```

## License

This project is open source and available under the MIT License.
