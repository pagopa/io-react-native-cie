# @pagopa/io-react-native-cie Example App

This is the official example application for the **[@pagopa/io-react-native-cie](https://www.npmjs.com/package/@pagopa/io-react-native-cie)** package.

> [!CAUTION]  
> **A physical device is required.** iOS simulators and Android emulators **do not support NFC** and therefore cannot be used for testing this app.

---

## 🚀 Getting Started

> **Note**  
> Before proceeding, ensure your development environment is properly set up by following the [React Native Environment Setup Guide](https://reactnative.dev/docs/set-up-your-environment).

### Step 1: Start Metro

Metro is the JavaScript bundler used by React Native. To start the development server, run:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

### Step 2: Build and Run the App

With Metro running, open a new terminal window and run the app on your desired platform.

#### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

#### iOS

> 💡 **Note:** CocoaPods is required for iOS projects.

1. If this is your first time setting up the project, install dependencies via Bundler:

   ```sh
   bundle install
   ```

2. Then install the native pods (every time you install or update native dependencies):

   ```sh
   bundle exec pod install
   ```

> [!TIP]
> If for some reason you cannot update CieSDK to the newer version, you might need to run:
>
> ```sh
> bundle exec pod cache clean --all
> bundle exec pod repo update --verbose
> bundle exec pod install --repo-update
> ```

For detailed CocoaPods setup, refer to the [CocoaPods Getting Started Guide](https://guides.cocoapods.org/using/getting-started.html).

Now you can run the app:

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If your environment is correctly configured, the app should launch on your connected device.

> ✅ You can also run the app directly from **Android Studio** or **Xcode** if you prefer a GUI-based approach.

---

## 📱 App Overview

This example app consists of three main screens:

- **Home Screen**  
  Shows the NFC capabilities of your device and provides navigation buttons to access other features.

- **Attributes Read Screen**  
  Allows reading the personal attributes stored on a CIE (Carta d’Identità Elettronica).

- **Authentication Screen**  
  Initiates the CIE-based authentication flow.

Each screen displays relevant events and errors using alerts or inline messages, so you can easily track the progress and debug the CIE interaction flow.
