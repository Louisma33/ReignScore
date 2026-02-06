# Google Play Service Account Setup Guide

## Why You Need This
To submit your Android app to Google Play Store via EAS, you need a **Service Account JSON key** that authenticates automated submissions.

## Step-by-Step Instructions

### Step 1: Open Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account (the one that owns the Google Play Developer account)

### Step 2: Create or Select a Project
1. Click the project dropdown at the top
2. Either select an existing project OR create a new one called "ReignScore"
3. Make sure the project is selected

### Step 3: Enable the Google Play Developer API
1. Go to: https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com
2. Click **"Enable"** button

### Step 4: Create a Service Account
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click **"+ CREATE SERVICE ACCOUNT"**
3. Fill in:
   - **Service account name**: `reignscore-eas-submit`
   - **Service account ID**: (auto-fills)
   - **Description**: `EAS CLI for automated app submissions`
4. Click **"CREATE AND CONTINUE"**
5. For Role: Skip this (click "CONTINUE")
6. Click **"DONE"**

### Step 5: Create JSON Key
1. In the service accounts list, find `reignscore-eas-submit`
2. Click the **three dots (⋮)** on the right → **"Manage keys"**
3. Click **"ADD KEY"** → **"Create new key"**
4. Select **"JSON"** format
5. Click **"CREATE"**
6. The file will download automatically (something like `reignscore-123456-abc123.json`)

### Step 6: Move the Key to Your Project
1. Rename the downloaded file to: `google-service-account.json`
2. Move it to: `C:\Users\1040g\Desktop\CardReign\google-service-account.json`

### Step 7: Link Service Account to Google Play Console
1. Go to: https://play.google.com/console
2. Click **"Settings"** (gear icon) → **"API access"**
3. Find your service account in the list
4. Click **"Grant access"**
5. Set permissions:
   - **App permissions**: Select "ReignScore"
   - **Account permissions**: Enable "Release apps to testing tracks" and "Manage production releases"
6. Click **"Invite user"**

### Step 8: Run the Submission Command
Once the above is complete, run:
```bash
npx eas submit --platform android --latest
```

## Troubleshooting

### "App not found" Error
- Make sure you've created the app in Google Play Console first
- The app package name must match: `com.williaml33.ReignScore`

### "Permission denied" Error  
- Go back to Step 7 and ensure proper permissions are granted
- Wait 5-10 minutes for permissions to propagate

## Security Notes
- ⚠️ The `google-service-account.json` file contains sensitive credentials
- Add it to `.gitignore` to prevent committing to version control
- Never share this file publicly
