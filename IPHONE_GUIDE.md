# How to Run ReignScore on Your iPhone

Since the simulator build (`.tar.gz`) cannot run on a physical phone, you have two options.

## Option 1: Expo Go (Free & Fast)
**Best for**: Checking UI, Colors, and basic navigation.
**Limitation**: **Native features will crash**.
-   **Plaid Link**: Will crash (requires native code).
-   **Face ID**: Might throw errors or be mock-only.
-   **Notifications**: May not receive real push tokens.

### Instructions:
1.  Download **Expo Go** from the App Store on your iPhone.
2.  Open your terminal in the project folder.
3.  Run: `npx expo start --tunnel`
4.  Scan the QR code shown in the terminal with your iPhone camera.

## Option 2: Native Ad-Hoc Build (In Progress)
**Best for**: Full feature testing on your specific device.

### Instructions (Once Build Completes):
1.  **Open the Link**: [Install ReignScore - Build 1](https://expo.dev/accounts/williaml33/projects/ReignScore/builds/b762bb9d-5b5c-4a76-ab22-a99bd79cef29)
2.  **Tap "Install"**: On your iPhone, allow the installation.
3.  **Developer Mode**:
    -   If the app fails to launch, go to your **iPhone Settings**.
    -   Tap **Privacy & Security**.
    -   Scroll down to the bottom to find **Developer Mode** and turn it ON.
    -   Restart your phone if prompted.
4.  **Launch**: Open "ReignScore" from your home screen.

### Troubleshooting
-   **"Untrusted Enterprise Developer"**:
    1.  On your **iPhone**, go to **Settings**.
    2.  Tap **General** -> **VPN & Device Management**.
    3.  Tap your email (under Developer App) and select **Trust**.
-   **"Unable to Verify App"**: Ensure you have an active internet connection on the first launch.
