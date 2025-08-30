# Real Estate App 🏠

This is a modern real estate mobile app built with [Expo](https://expo.dev), [React Native](https://reactnative.dev), and [NativeWind](https://www.nativewind.dev/) for utility-first styling. The app features a Netflix-inspired dark theme for a visually appealing and accessible user experience.

## Features

- Browse properties for sale and rent
- View property details and images
- User authentication (Sign In / Sign Up)
- Profile management
- Explore tab for discovering new listings
- Responsive, mobile-first design
- Dark mode with custom theme colors

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the app**
   ```bash
   npx expo start
   ```

You can open the app in:
- [Expo Go](https://expo.dev/go)
- Android emulator
- iOS simulator
- Development build

## Project Structure

- `app/` — Source code and screens
  - `sign-in.tsx` — Sign-in page
  - `(root)/` — Main tabs and property routes
  - `global.css` — Global styles
- `assets/` — Images and fonts
- `tailwind.config.js` — Theme and styling configuration

## Theming

This app uses a custom dark theme inspired by Netflix:
- **Background:** #141414
- **Primary (Accent):** #E50914
- **Text:** #FFFFFF / #B3B3B3
- **Surface:** #222222

All colors are configured in `tailwind.config.js` and used via NativeWind utility classes.

## Development

- Edit screens in the `app/` directory
- Use file-based routing for navigation
- Customize theme in `tailwind.config.js`

## Reset Project

To reset the project to its initial state:
```bash
npm run reset-project
```
