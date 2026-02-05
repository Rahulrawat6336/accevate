# Accevate App

A mobile-first application built with **React Native**.

---

## Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Yarn](https://yarnpkg.com/) or npm
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- Android Studio / Xcode (for building Android/iOS apps)
- Git
- SSH keys configured for GitHub and Bitbucket (if using both remotes)

---

## Installation

Clone the repository:

```bash
git clone git@github.com:Rahulrawat6336/accevate.git
cd accevate
Install dependencies:

npm install --force

Running the App
Android
Start Metro Bundler:

npx react-native start
In a separate terminal, run:

npx react-native run-android
iOS
Start Metro Bundler:

npx react-native start
In a separate terminal, run:

npx react-native run-ios
If you face CocoaPods issues:

cd ios
pod install --repo-update
cd ..
Build APK / IPA
Android APK
cd android
./gradlew assembleRelease
Release APK location:

android/app/build/outputs/apk/release/app-release.apk
```
