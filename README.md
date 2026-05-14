# Crop Wise Yield Predictor

A data-driven farming assistant built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

This project helps farmers and agricultural planners estimate crop yield, analyze profit potential, explore crop calendars, view weather forecasts, and access AI-enabled crop recommendations.

## Key features

- District-level crop yield prediction
- Crop recommendation and profit analysis
- Farming calendar insights for crop cycles
- Weather forecast support for agricultural planning
- Multilingual content translation support
- Supabase functions for server-side data processing
- PDF report generation for sharing results

## Tech stack

- Frontend: React, TypeScript, Vite
- Styling: Tailwind CSS, shadcn/ui
- State + forms: React Hook Form, React Query, Zod
- Charts: Recharts
- Maps: Mapbox GL
- Backend: Supabase, Supabase Edge Functions
- Utilities: jsPDF, date-fns, clsx

## Repository structure

- src/ — application source code
  - components/ — reusable UI components and pages
  - contexts/ — auth and translation providers
  - hooks/ — custom hooks for device, toast, speech, translation
  - lib/ — shared utilities
  - pages/ — route-level pages for landing, auth, dashboard, prediction
  - utils/ — report generation helpers
- supabase/ — Supabase config and backend functions
  - functions/ — crop-calendar, crop-chat, crop-prediction, profit-analysis, translate-content, weather-forecast
- public/data/ — agricultural datasets used by the app

## Installation

### Prerequisites
- Node.js 18+ or newer
- npm
- Optional: Supabase project for backend and auth integration

### Install dependencies

```sh
npm install
```

### Run locally

```sh
npm run dev
```

Open the local URL shown by Vite, typically http://localhost:5173.

### Build for production

```sh
npm run build
```

### Preview production build

```sh
npm run preview
```

## Supabase integration

This project includes Supabase-backed backend functions for crop and weather features.

Use your own Supabase project and configure the required environment variables if you want to run the backend locally.

## Data sources

The repository includes agricultural data under public/data/:

- Agriculture_Yield_India.csv
- Crop_recommendation.csv
- India_District_Crop_Production.csv

## Notes

- The application uses react-router-dom for routing and react-query for async data fetching.
- shadcn/ui is used for consistent component styling and layout.
- There is a Supabase config.toml file at supabase/config.toml for local Supabase setup.

## Contributing

1. Fork the repository.
2. Create a new branch.
3. Install dependencies and run the app.
4. Implement changes and test locally.
5. Submit a pull request.

## License

Add a license to this project if needed.
