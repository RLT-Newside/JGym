# Privacy Policy — JGym

**Last Updated:** 2026-06-17

## 1. Who We Are

JGym is a free, open-source fitness tracking application developed by Justin Marty (RLT-Newside). Source code is available at https://github.com/RLT-Newside/JGym.

## 2. Data We Collect

JGym stores the following data **locally on your device only**:

- Workout sessions (exercises, sets, reps, weight lifted)
- Custom exercises with muscle group associations
- Nutrition data (food entries, calories, protein, carbs, fat)
- Water intake logs
- Body weight history
- Activity/cardio entries
- Training plans and preferences
- App settings (theme, supporter status)

**All data remains on your device.** We do not operate servers that receive or store your fitness data. JGym has no user accounts and performs no tracking. The only outbound network requests are the optional, user-initiated third-party integrations listed in Section 3; if you never use them, JGym sends nothing.

## 3. Third-Party Services

JGym makes the following optional network requests:

### OpenFoodFacts (barcode scanning)
- **When:** Only when you scan a product barcode
- **What is sent:** The product barcode number
- **Recipient:** OpenFoodFacts (https://world.openfoodfacts.org)
- **Purpose:** Look up nutrition information for scanned products
- **You can opt out:** Enter nutrition data manually instead of scanning

### GitHub API (update check & supporter verification)
- **When:** On app startup
- **What is sent:** No personal data (plain GET requests)
- **Purpose:** Check for app updates and verify supporter activation codes

### Strava (workout upload)
- **When:** Only if you connect a Strava account (Settings → Strava) and only when you explicitly tap "Send to Strava" on a finished session. Disabled by default; uploads never happen automatically.
- **What is sent:** The selected session's exercises, sets, reps, weights, date and duration. No other JGym data (nutrition, weight, water, etc.) is ever sent.
- **Recipient:** Strava (https://www.strava.com). Uploaded data is then governed by Strava's own privacy policy.
- **Login tokens:** Strava sign-in uses OAuth. The authorization step passes through a JGym-operated login proxy whose only role is to exchange and refresh Strava tokens; it stores nothing and never receives your workout content (workouts are sent directly from your device to Strava). The resulting access tokens are stored only in your device's local storage.
- **You can opt out:** Don't connect Strava, or tap Disconnect in Settings → Strava (also cleared by Delete All Data). Disconnecting removes the stored tokens from your device.

## 4. Data We Do NOT Collect

- No user accounts or registration
- No analytics or behavioral tracking
- No advertising identifiers
- No location data
- No device identifiers sent to servers
- No cookies

## 5. Your Rights

### Access
All your data is visible directly in the app at all times.

### Export (Data Portability)
Settings → Export All — downloads all your data as a portable JSON file.

### Deletion (Right to Erasure)
Settings → Delete All Data — permanently removes all stored data from your device. This action is irreversible.

### Withdraw Consent
You may uninstall the app at any time. All locally stored data is removed with the app.

## 6. Data Retention

Data is retained on your device until you manually delete it or uninstall the app. There is no automatic expiration.

## 7. Data Security

Your data is stored in the browser's localStorage on your device. On Android, this data is sandboxed within the app and inaccessible to other apps.

## 8. Children's Privacy

JGym is intended for users aged 13 and older. We do not knowingly collect data from children under 13. If you are under 13, please do not use this app without parental consent.

## 9. Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last Updated" date above and in the app's release notes.

## 10. Contact

For privacy questions or data requests:
- GitHub Issues: https://github.com/RLT-Newside/JGym/issues
- Email: See repository contact information
