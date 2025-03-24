# LeoSmart App

A React Native application with multiple themes and internationalization support.

## Features

- **React Native Framework**: Built with React Native without Expo
- **UI Framework**: Uses React Native Paper (Material Design)
- **Internationalization**: Multi-language support with caching
- **Theming**: Light, Dark, and System theme support
- **State Management**: Redux with Redux Toolkit
- **Navigation**: React Navigation with bottom tabs
- **Charts & Statistics**: Victory Native for data visualization

## Project Structure

```
leosmart/
├── src/
│   ├── assets/            # Images, fonts, and other static assets
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom React hooks
│   ├── i18n/              # Internationalization setup
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # App screens
│   ├── services/          # API and other services
│   ├── store/             # Redux store and slices
│   │   └── slices/        # Redux Toolkit slices
│   ├── theme/             # Theme configuration
│   └── utils/             # Utility functions
├── android/               # Android native code
├── ios/                   # iOS native code
├── .gitignore
├── App.tsx               # Main application component
├── index.js              # Entry point
└── package.json          # Dependencies and scripts
```

## Setup & Running

### Prerequisites

- Node.js (18 or newer)
- React Native CLI
- Android Studio / Xcode

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```

### Running the app

#### iOS
```
pnpm ios
```

#### Android
```
pnpm android
```

## App Requirements

1. Built with React Native (no Expo)
2. Uses mainstream UI framework (React Native Paper)
3. Internationalization support
   - First load: fetch from backend and cache
   - Subsequent loads: use cache and update asynchronously
4. Multiple themes support (Light/Dark/System)
5. Charting for statistics using Victory Native
6. Compatible with both iOS and Android
7. Reusable component architecture
8. State management with Redux Toolkit

## License

This project is private and proprietary.

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
