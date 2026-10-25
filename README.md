# HBPlus Access

HBPlus Access is an internal workspace sign-in application for the HB+ team. It provides Google-based authentication, verified email-domain authorization, protected Web navigation, Firestore user-profile persistence, and a small role-aware dashboard demonstration.

The repository contains an Expo application targeting Web and configured native Android/iOS builds. Production deployment and live production authentication/Firestore verification are not complete.

## Features

### Implemented

- Responsive HB+ login UI built with React Native components and compatible with React Native Web.
- Google sign-in through Firebase Authentication:
  - Web uses `signInWithPopup`.
  - Native platforms use `@react-native-google-signin/google-signin` and exchange the Google ID token for a Firebase credential.
- Verified email requirement and exact domain authorization:
  - Production: verified `@hbplus.fit` accounts only.
  - Development builds: verified `@hbplus.fit` and `@gmail.com` accounts are accepted by the client for local testing.
- Unauthorized accounts are signed out and shown the existing restriction message.
- Authentication loading state, sign-in loading state, cancellation handling, and user-facing errors.
- Protected Web navigation:
  - `/` renders Login.
  - `/dashboard` renders the normal Dashboard.
  - `/admin` renders the Admin Dashboard only for an authenticated user with the trusted `role: "admin"` claim.
- Signed-out users are redirected to `/`.
- Non-admin users who open `/admin` are redirected to `/dashboard`.
- Logout clears Firebase authentication and returns the Web URL to `/`.
- Firestore profile initialization at `users/{firebaseAuthUid}`.
- Trusted Firebase Auth custom-claim reading for `admin` and default `user` roles.
- Google sign-in, logout, development profile persistence, and role-aware Dashboard display were manually tested in the development environment.

### Incomplete or not implemented

- The normal Dashboard remains a placeholder.
- The Admin Dashboard is a role-aware presentation screen, not a full administration product.
- No registration flow exists.
- No permanent admin-management UI exists.
- No trusted role-assignment backend is deployed.
- No admin-only Firestore collection or privileged data operation is implemented.
- Production authentication, production Firestore persistence, and production deployment have not been live-tested.

## Technology stack

- **Expo SDK 58** — application tooling, platform integration, and Web export.
- **React Native 0.88** — cross-platform UI primitives.
- **React Native Web** — renders the same React Native components in the browser.
- **React 19** — component and state model.
- **TypeScript** — static checking for application code.
- **Firebase JavaScript SDK 13** — Firebase App, Authentication, and Firestore client APIs.
- **`@react-native-google-signin/google-signin` 16.1.5** — native Google authentication integration.

## Architecture

The application uses a small provider-and-screen architecture without a routing dependency.

- `App.tsx` is the entry component and wraps the application in `AuthProvider`.
- `src/context/AuthContext.tsx` owns Firebase auth state, sign-in, logout, authorization checks, profile persistence, and trusted role resolution.
- `src/services/firebase.ts` validates public Firebase environment variables, initializes or reuses the Firebase app, and exports Auth and Firestore instances.
- `src/navigation/AppNavigator.tsx` handles auth loading, protected screen selection, and Web History API URL synchronization.
- `src/screens/LoginScreen.tsx` renders the existing login page.
- `src/screens/DashboardScreen.tsx` renders the normal authenticated placeholder dashboard and logout action.
- `src/screens/AdminScreen.tsx` renders the admin-only Web screen when the trusted admin claim is present.
- `src/components/GoogleSignInButton.tsx` renders the branded Google button, loading state, and accessibility state.
- `src/utils/domainValidation.ts` applies the verified-email and development/production domain rules.
- `firestore.rules` contains the repository's Firestore Security Rules for user profiles.

```mermaid
flowchart TD
  A[App.tsx] --> B[AuthProvider]
  B --> C[Firebase Auth]
  B --> D[Firestore users/{uid} profile]
  A --> E[AppNavigator]
  E -->|isLoading| F[Loading indicator]
  E -->|signed out| G[LoginScreen]
  E -->|authorized user| H[DashboardScreen]
  E -->|Web + role == admin + /admin| I[AdminScreen]
  G --> J[GoogleSignInButton]
  J --> B
```

Profile persistence is currently implemented inside `AuthContext.tsx`; there is no separate profile-service module.

## Authentication flow

1. `AuthProvider` subscribes to Firebase `onAuthStateChanged`.
2. While Firebase resolves the session, `AppNavigator` renders an activity indicator.
3. On Web, the button calls Firebase `signInWithPopup` with Google and `prompt: "select_account"`.
4. On native platforms, the app configures Google Sign-In with `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, obtains an ID token, and exchanges it with `GoogleAuthProvider.credential()` and `signInWithCredential()`.
5. The authenticated Firebase user must have a verified email and pass `isAuthorizedUser()`.
6. Unauthorized users are signed out and receive:

   ```text
   Access restricted. Please login using your official domain email.
   ```

7. Authorized users initialize their Firestore profile before being granted Dashboard access.
8. The role is read from the signed Firebase Auth token using `user.getIdTokenResult()`.
   - Exact claim value `role: "admin"` resolves to `admin`.
   - Missing or other values resolve to `user`.
9. Logout calls Firebase `signOut`, clears local user/role state, and returns Web navigation to `/`.

The client never assigns custom claims. A trusted Admin SDK process must assign them.

## Firebase setup

Use separate Firebase projects for development and production:

- `hbplus-access-dev` is used for local development testing, including the development Gmail exception.
- `hbplus-access` is the production project.

Do not use development rules or development environment values for a production deployment.

### Authentication setup

1. Create or select the Firebase project for the environment.
2. Register the Web app and copy its configuration into the local environment file.
3. In Firebase Console, open **Authentication > Sign-in method** and enable Google.
4. Configure the provider support email as required by Firebase/Google.
5. In **Authentication > Settings > Authorized domains**, add local development hosts such as `localhost` and the final deployed hostname before testing there.
6. For native builds, register the Android/iOS applications and keep their native Firebase files aligned with the identifiers in `app.json`.

The Web flow uses Firebase's popup API. Native Google Sign-In requires an Expo development build because the native package is not included in standard Expo Go.

### Firestore setup

1. Create Firestore Database for the target Firebase project using the intended edition and region.
2. Review `firestore.rules` before publishing.
3. The repository does not currently contain `firebase.json` or `.firebaserc`, and the Firebase CLI is not installed locally.
4. After configuring the Firebase CLI for the intended project, rules can be deployed with:

   ```bash
   firebase deploy --only firestore:rules
   ```

   Deployment has not been performed or verified as part of this repository work.

   Alternatively, review and publish the contents of `firestore.rules` through the Firebase Console. Do not deploy permissive development rules to production.

## Environment configuration

Expo loads `.env` values with the `EXPO_PUBLIC_` prefix into the client bundle. These values are public application configuration, not server-side secrets. Never place Admin SDK service-account keys, private keys, or other server credentials in this app.

The repository includes `.env.example` with placeholders only. Copy it to `.env` and replace placeholders locally:

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

Variable purposes:

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Identifies the Firebase Web API configuration. |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Authentication Web domain. |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Selects the Firebase project. |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase project storage configuration. |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging/project identifier. |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Identifies the registered Firebase application. |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Native Google Sign-In Web client ID used to obtain an ID token. |

Current local environment handling:

- `.env` is local and Git-ignored.
- `.env.production.local` is the Git-ignored production backup.
- The current `.env` is restored to the production `hbplus-access` configuration; environment values are intentionally not documented here.
- Restart Expo after changing environment files so the new values are loaded.
- Never commit `.env`, `.env.production.local`, or real values copied from them.

## Firestore data model

The client reads and writes one profile document per Firebase Auth UID:

```text
users/{uid}
```

Example document using placeholders only:

```json
{
  "uid": "<firebase-auth-uid>",
  "email": "<authorized-email>",
  "displayName": "<display-name-or-null>",
  "photoURL": "<photo-url-or-null>",
  "createdAt": "<Firestore Timestamp>",
  "lastLoginAt": "<Firestore Timestamp>"
}
```

| Field | Purpose |
| --- | --- |
| `uid` | Firebase Auth UID and document ownership identifier. |
| `email` | Authenticated user email. |
| `displayName` | Google profile display name, or `null`. |
| `photoURL` | Google profile photo URL, or `null`. |
| `createdAt` | Server timestamp assigned only when the profile is first created. |
| `lastLoginAt` | Server timestamp refreshed during each successful profile initialization. |

`initializeUserProfile()` uses a Firestore transaction. It reads the existing profile, preserves `createdAt` when present, and writes `lastLoginAt` with `serverTimestamp()` on every successful login. It uses `{ merge: true }` but still writes the six fields validated by the rules.

The profile write happens only after the client-side authorization check. If Firestore rejects the transaction, the app shows a profile-initialization error, clears local access, and signs the user out.

### Development versus production rules

The committed `firestore.rules` file is production-restrictive:

- Profile writes require a signed-in user.
- The Auth email must be verified.
- The Auth email must match the exact case-insensitive `@hbplus.fit` domain.
- The document ID and `uid` must match the authenticated UID.
- The profile email must match the Auth email.
- Only the six profile fields are allowed.
- `createdAt` cannot change on update.
- Deletes are denied.
- No role field is accepted in the client-writable profile.

The development client allows verified Gmail accounts through `__DEV__`, but the committed production rules do not. A development Firebase project therefore needs separately managed development-only rules if Gmail profile persistence is to be tested. Those development rules are not included in this repository and must never be published to production.

## Security rules and authorization

There are two distinct authorization layers:

1. **Client navigation/UI:** `AuthContext` and `AppNavigator` decide which screen to render. This improves user experience but can be bypassed by a modified client.
2. **Firestore data authorization:** Firestore Security Rules must protect every sensitive collection. The current rules protect only the user profile collection and do not define admin-only data access.

The `users/{uid}` profile does not contain `role` or `isAdmin`. Clients cannot assign or change Firebase Auth custom claims. Any future admin-only collection must use a rule condition based on the trusted Auth token, such as `request.auth.token.role == 'admin'`, together with the existing verified-domain policy and field validation.

## Role-based access control

### Role resolution

`AuthContext.tsx` calls `user.getIdTokenResult()` and reads the signed Firebase Auth custom claim named `role`:

- `role === "admin"` resolves to the `admin` role.
- Missing claims and all other values resolve to `user`.
- The role is held in React context state and is not written to Firestore.

### Role assignment

The development admin test claim was assigned once in the `hbplus-access-dev` project using a Firebase Admin SDK script executed in Google Cloud Shell with Application Default Credentials. No Admin SDK credentials were placed in the repository, and no permanent backend was deployed.

The client cannot assign claims. A production role-management workflow would require a trusted Admin SDK service, Cloud Function, Cloud Run service, or another protected operator process.

### Routes

- `/dashboard` is the normal authenticated dashboard route.
- `/admin` renders `AdminScreen` only when the authenticated role is exactly `admin`.
- A non-admin opening `/admin` is redirected to `/dashboard`.
- A signed-out user opening `/admin` or `/dashboard` is redirected to `/` after auth loading resolves.
- On native platforms, the current navigator preserves the existing Dashboard rendering behavior because there is no browser pathname.

Verified development behavior:

- An account with trusted `role: "admin"` displayed `Admin Dashboard` and administrator access confirmation.
- A second development account without the admin claim was redirected to the normal User Dashboard.
- These tests demonstrate UI/navigation behavior only. They do not prove that admin-only data is secured because no admin-only Firestore collection or privileged operation exists.

## Local development

Install dependencies:

```bash
npm install
```

Start the Web development server:

```bash
npm run web
```

Open the local URL printed by Expo, commonly a localhost address. If an environment file changes, stop and restart Expo before testing.

Run the TypeScript check:

```bash
npx.cmd tsc --noEmit
```

Create a production Web export:

```bash
npx expo export --platform web
```

The generated static Web files are written to `dist/`.

## Testing and verification

| Area | Status | Notes |
| --- | --- | --- |
| TypeScript | Verified | `npx.cmd tsc --noEmit` has passed. |
| Web Google sign-in | Development verified | Browser sign-in was tested against the development environment. |
| Logout | Development verified | Logout returned the app to the login state. |
| Firestore profile persistence | Development verified | Profile creation and subsequent persistence were tested in the development project. |
| Role-aware Dashboard | Development verified | Admin claim displayed Admin Dashboard; account without the claim displayed User Dashboard. |
| Production Google sign-in | Not verified | No live production authentication test has been completed. |
| Production Firestore persistence | Not verified | No live production profile-write test has been completed. |
| Android native authentication | Not verified in this documentation update | Requires a configured native development build. |
| iOS authentication | Not verified | Windows environment has no iOS build/device validation. |
| Automated test suite | Not present | No Jest, Detox, or end-to-end test suite is configured. |

## Android and iOS setup

`app.json` currently includes:

- Android package: `com.hbplus.access`.
- iOS bundle identifier: `com.hbplus.access`.
- Android Firebase file: `./google-services.json`.
- iOS Firebase file: `./GoogleService-Info.plist`.
- `@react-native-google-signin/google-signin` Expo plugin.

Native Google Sign-In requires a development build. The native OAuth client IDs, package/bundle identifiers, SHA configuration, and URL scheme settings must be configured in Firebase/Google Cloud for the target build. No native build is performed by the Web commands in this README.

## Deployment to Netlify

No Netlify configuration or live deployment URL currently exists in the repository.

To prepare a deployment:

1. Select the intended production environment values before exporting. Do not export production while `.env` points at a development project.
2. Confirm the Firebase production Google provider and authorized domains.
3. Run:

   ```bash
   npx expo export --platform web
   ```

4. Publish the generated `dist/` directory through Netlify.
5. Add the final Netlify hostname to Firebase Authentication > Settings > Authorized domains.
6. If direct refreshes of `/dashboard` or `/admin` need SPA fallback handling, configure Netlify to serve `/index.html` for unmatched paths. A common `_redirects` entry is:

   ```text
   /* /index.html 200
   ```

   This redirect file is not currently present in the repository.

Do not commit `.env` or `.env.production.local`, and do not claim a deployment URL until Netlify reports a successful deployment.

## Troubleshooting

### Firebase configuration error

`src/services/firebase.ts` checks the six Firebase environment variables at startup and throws a list of missing variable names. Confirm the local `.env` exists, contains non-empty values for the target project, and restart Expo.

### Popup or authorized-domain error

The Web flow uses `signInWithPopup`. Check that the browser permits popups and that the exact local or deployed hostname is listed in Firebase Authentication Authorized Domains. The browser may also show cross-window policy warnings; inspect whether `signInWithPopup` actually resolves or returns a Firebase error code.

### Unauthorized email

The Auth user must have a verified email. Production accepts only the exact `@hbplus.fit` domain. The development client additionally allows verified Gmail accounts, but production Firestore rules still reject Gmail profile writes.

### Profile initialization failure

The app signs the user out when the Firestore transaction fails. Check the Firestore error code, confirm the target project has Firestore enabled, and verify that the deployed rules match the authenticated account and profile field schema. A `permission-denied` result commonly indicates a rules/project mismatch.

### Stale custom claim

Custom claims are delivered in Firebase Auth ID tokens. After assigning or changing a claim, sign out and sign in again, or refresh the ID token, before checking the Dashboard route. The client does not assign claims.

### Route redirect behavior

The navigator waits for auth initialization. Signed-out users are sent to `/`; authenticated users normally go to `/dashboard`; only an authenticated admin claim may remain at `/admin`.

## Project structure

```text
.
├── App.tsx
├── index.ts
├── app.json
├── eas.json
├── firestore.rules
├── package.json
├── .env.example
├── assets/
└── src/
    ├── components/
    │   └── GoogleSignInButton.tsx
    ├── context/
    │   └── AuthContext.tsx
    ├── navigation/
    │   └── AppNavigator.tsx
    ├── screens/
    │   ├── AdminScreen.tsx
    │   ├── DashboardScreen.tsx
    │   └── LoginScreen.tsx
    ├── services/
    │   └── firebase.ts
    └── utils/
        └── domainValidation.ts
```

## Limitations and future improvements

- Build a real Dashboard instead of the current placeholder.
- Add actual admin-only features and separate admin navigation where required.
- Add admin-only Firestore collections and rules using trusted Auth claims.
- Add a permanent trusted role-assignment/admin-management service.
- Add automated unit and end-to-end tests.
- Complete live production authentication and Firestore verification.
- Complete Netlify deployment and configure the deployed authorized domain.
- Validate native Android and iOS builds on their target environments.
- Consider a dedicated development rules file and Firebase CLI configuration for repeatable environment deployment.

## Submission checklist

- [x] Source code remains TypeScript and uses the existing Expo project.
- [x] Google sign-in UI, loading state, logout, and protected navigation are implemented.
- [x] Firestore profile persistence is implemented.
- [x] Role-aware `/dashboard` and `/admin` behavior is implemented.
- [x] `.env.example` contains placeholders only.
- [x] `.env` and `.env.production.local` remain Git-ignored.
- [x] TypeScript check passes.
- [x] Development Google sign-in, logout, profile persistence, and role display were tested.
- [ ] Production Google sign-in and Firestore profile persistence are live-tested.
- [ ] Firestore rules are confirmed deployed to the intended production project.
- [ ] Web export is regenerated for the final commit.
- [ ] Netlify deployment is completed.
- [ ] Netlify URL is added to Firebase Authentication Authorized Domains.
- [ ] Final browser verification is completed against the deployed site.
- [ ] No environment values, credentials, private keys, or test-account identifiers are committed.
