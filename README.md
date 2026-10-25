# HB+ Access

HB+ Access is an internal workspace sign-in application for the HB+ team. It uses Firebase Authentication for Google sign-in and protects access to the workspace with verified email-domain validation.

## Implemented features

- Responsive React Native login screen for Web and mobile layouts.
- Google sign-in through Firebase Authentication on Web.
- Native Google sign-in integration for the configured Android/iOS build path.
- Verified-email authorization for `@hbplus.fit` accounts.
- Development-only `@gmail.com` allowance for local testing.
- Loading, cancellation, authentication-error, and unauthorized-account handling.
- Protected Dashboard rendering and Web URL synchronization:
  - Login: `/`
  - Dashboard: `/dashboard`
- Sign-out support.
- Firestore profile initialization at `users/{firebaseAuthUid}`.
- Local Firestore Security Rules in `firestore.rules`.
- Trusted Firebase Auth custom-claim reading for `admin` and default `user` roles.
- Browser Google sign-in and logout tested against the development environment.
- User profiles successfully created and persisted in the development Firestore project.
- Role-aware Dashboard display tested with both an admin-claim account and a standard account.

The Dashboard is currently a placeholder with a sign-out action.

## Technology stack

- Expo SDK 58
- React Native 0.88
- React Native Web
- React 19
- TypeScript
- Firebase JavaScript SDK 13
- `@react-native-google-signin/google-signin` 16.1.5

## Prerequisites

- Node.js and npm.
- A Firebase project with Authentication and Firestore enabled.
- For Web testing: a browser and an authorized Firebase Authentication domain.
- For Android native testing: Android tooling and an Expo development build. The native Google Sign-In package is not available in standard Expo Go.

## Installation

Install the existing project dependencies:

```bash
npm install
```

Create a local `.env` file in the project root. `.env` is ignored by Git and must not be committed.

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<your-firebase-project-id>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-firebase-messaging-sender-id>
EXPO_PUBLIC_FIREBASE_APP_ID=<your-firebase-app-id>

# Required for native Google Sign-In builds only.
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<your-google-web-client-id>
```

The application fails clearly during Firebase initialization if any required `EXPO_PUBLIC_FIREBASE_*` value is missing. Never replace the placeholders with committed secrets.

## Run the Web app

```bash
npm run web
```

This runs `expo start --web`.

## Build the Web app

Create a production Web export with:

```bash
npx expo export --platform web
```

The generated Web app is written to:

```text
dist/
```

## Firebase Authentication setup

1. Create or select the Firebase project used by the environment variables.
2. Enable Google under Firebase Console > Authentication > Sign-in method.
3. Add the local Web origin, such as `localhost`, to Authentication > Settings > Authorized domains.
4. Use a verified Google account for production-domain testing.

The Web flow uses Firebase `signInWithPopup`. Native builds use `@react-native-google-signin/google-signin`, exchange the returned ID token for a Firebase credential, and require `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

## Firestore setup

Create a Firestore Database using the Standard edition and the project's intended location. The client creates or updates:

```text
users/{firebaseAuthUid}
```

The profile fields are limited to:

- `uid`
- `email`
- `displayName`
- `photoURL`
- `createdAt`
- `lastLoginAt`

`createdAt` is preserved after creation, while `lastLoginAt` is updated on successful profile initialization.

The repository contains the rules file:

```text
firestore.rules
```

The rules allow only the authenticated user to access their own profile, require a verified `@hbplus.fit` email, reject extra fields such as `role` and `isAdmin`, and prevent `createdAt` from changing.

## Admin/User roles

The client reads the trusted Firebase Auth custom claim `role`. A claim with the exact value `admin` produces the admin role; all missing or other values default to `user`. The role is exposed through `AuthContext` and the placeholder Dashboard presents role-aware content.

The client cannot assign or change claims, and roles are not stored in the client-writable `users` profile. A secure admin assignment workflow still requires a trusted server-side mechanism such as Firebase Admin SDK, Cloud Functions, or Cloud Run. Do not put Admin SDK credentials in the app or add a client-side role setter.

No role-specific Firestore collections or operations currently exist. If they are added, their rules must check `request.auth.token.role` directly and must not trust a profile field supplied by the client.

Development role verification used two accounts:

- A development account with the trusted Firebase Auth custom claim `role: "admin"` displayed `Admin workspace`.
- A second development account without the admin claim displayed `User workspace`.

The admin claim was assigned once using a Firebase Admin SDK script run in Google Cloud Shell. No backend service was deployed. The client cannot assign or change this claim.

This repository does not currently include Firebase CLI configuration such as `firebase.json`, and rule deployment has not been verified here. After installing and configuring the Firebase CLI for the intended project, deploy the rules with:

```bash
firebase deploy --only firestore:rules
```

Alternatively, review and publish the contents of `firestore.rules` through the Firebase Console. Do not deploy permissive development rules to production.

## Email authorization

Users must have a verified email address whose domain is exactly `@hbplus.fit`, case-insensitively, for production access.

Development builds additionally allow verified `@gmail.com` accounts in `src/utils/domainValidation.ts` so the Dashboard can be tested locally. This exception is controlled by `__DEV__` and is not enabled in production builds. Firestore production rules still accept only verified `@hbplus.fit` accounts, so Gmail profile writes will be rejected when those rules are active.

The current `.env` targets the production Firebase project. `.env.production.local` is a Git-ignored backup of the production configuration. Neither file is documented with or should expose actual environment values.

## Android setup

Android configuration currently includes:

- Package name: `com.hbplus.access`
- Firebase file: `./google-services.json`
- Google Sign-In Expo config plugin in `app.json`
- Native Google Sign-In flow in `AuthContext.tsx`

The Android Firebase file must contain a client for the configured package name. A native development build is required before testing native Google Sign-In. Android authentication has existing project support, but a successful native build/test is not claimed by this documentation.

## TypeScript check

Run:

```bash
npx.cmd tsc --noEmit
```

## Current limitations and not-yet-implemented features

- The Dashboard remains a placeholder.
- Separate admin-only routes are not implemented.
- Actual admin-only features are not implemented.
- Admin-only Firestore collections are not implemented.
- No registration flow is implemented.
- No persistent backend role-assignment workflow exists; the tested admin claim was assigned by a one-time trusted script.
- Production deployment has not been completed.
- Live production Google authentication and Firestore profile testing have not been completed.
- Firestore rule deployment status must still be verified for the production project.
- iOS runtime authentication has not been verified because an iOS build environment/device is not available on Windows.
- Web hosting/deployment configuration is not included in the repository; no deployment URL is claimed.
