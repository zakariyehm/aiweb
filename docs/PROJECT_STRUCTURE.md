### Project Structure

This document explains the directory layout and the purpose of each folder/file in the app.

```text
ai/
  app/
    _layout.tsx
    +not-found.tsx
    index.tsx
    (tabs)/
      _layout.tsx
      actionDialog.tsx
      analytics.tsx
      index.tsx
      profile.tsx
      settings.tsx
    actionDialog/
      _layout.tsx
      saved.tsx
      scan.tsx
      upload.tsx
    onboarding/
      _layout.tsx
      personal-info.tsx
      signin.tsx
      splash.tsx
      welcome.tsx
  assets/
    fonts/
      SpaceMono-Regular.ttf
    images/
      adaptive-icon.png
      favicon.png
      icon.png
      logo.png
      partial-react-logo.png
      react-logo.png
      react-logo@2x.png
      react-logo@3x.png
      splash-icon.png
  components/
    DailyRecommendationCard.tsx
    ProgressRing.tsx
  constants/
    Colors.ts
  hooks/
    useColorScheme.ts
    useColorScheme.web.ts
    useThemeColor.ts
  lib/
    firebase.ts
  scripts/
    reset-project.js
  app.json
  eslint.config.js
  expo-env.d.ts
  package.json
  package-lock.json
  README.md
  tsconfig.json
```

### Key directories

- `app/`: Expo Router v3 routes. Each file is a screen; folders group routes and provide nested layouts via `_layout.tsx`.
  - `(tabs)/`: The bottom tab navigator. The custom `+` button opens a modal action sheet.
    - `_layout.tsx`: Declares the tab bar, the `+` action modal (Scan, Upload, Food Saved), and their handlers.
    - `index.tsx`, `analytics.tsx`, `profile.tsx`, `settings.tsx`: Tab screens.
  - `actionDialog/`: Stack for action flows opened from the `+` dialog.
    - `_layout.tsx`: Stack layout and titles for `scan`, `upload`, and `saved`.
    - `scan.tsx`: Trial flow with payment dialog.
    - `upload.tsx`: Placeholder for gallery upload flow.
    - `saved.tsx`: List of saved meals (mock data for now).
  - `onboarding/`: Onboarding flow and splash.
    - `splash.tsx`: Animated splash that routes to `welcome`.
    - `welcome.tsx`, `signin.tsx`, `personal-info.tsx`: Onboarding steps.
  - `_layout.tsx`: Root stack layout for the entire app tree.
  - `+not-found.tsx`: 404 route for unknown paths.

- `assets/`: Static assets bundled with the app.
  - `images/`: App icons, splash image, and logos.
  - `fonts/`: Custom fonts.

- `components/`: Reusable UI components used across screens.

- `constants/`: Static configuration values like theme colors.

- `hooks/`: Reusable React hooks for theming and color scheme handling.

- `lib/`: Client libraries and integrations (e.g., Firebase initialization).

- `scripts/`: Utility scripts for maintenance and development tasks.

### Config files

- `app.json`: Expo configuration. Includes splash screen plugin with background color and image.
- `eslint.config.js`: Linting rules.
- `tsconfig.json`: TypeScript configuration.
- `expo-env.d.ts`: Expo types augmentation.

### Routing notes

- Use `router.push('/segment/screen')` to navigate to a route defined under `app/`.
- `_layout.tsx` files define navigators (stacks/tabs) and shared options for their nested routes.
- Files or folders wrapped in parentheses like `(tabs)` are grouping segments and do not appear in the URL.

### Adding a new screen

1. Create a file under the appropriate folder in `app/`, for example `app/profile/edit.tsx`.
2. If the screen needs to be part of a navigator, ensure the parent folder has an `_layout.tsx` that renders a Stack/Tab and optionally registers screen options.
3. Navigate to it with something like:

```ts
import { router } from 'expo-router';
router.push('/profile/edit');
```






