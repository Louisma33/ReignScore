# ReignScore - Release Candidate 1 Handover

## Build Artifact
**File**: `ReignScore.tar.gz`
**Location**: Project Root (`C:\Users\1040g\Desktop\CardReign\`)
**Size**: ~47 MB
**Type**: iOS Simulator Build (x86_64 / arm64)

## Installation Instructions (Mac Required)
Since this is an iOS Simulator build, it must be installed on a macOS device running Xcode Simulator.

1.  **Transfer**: Copy `ReignScore.tar.gz` to your Mac.
2.  **Extract**: Double-click to unzip. You will see `ReignScore.app`.
3.  **Launch Simulator**: Open your iOS Simulator.
4.  **Install**: Drag `ReignScore.app` directly onto the Simulator window.

## Option 2: Run on Windows (via Cloud)
If you do not have a Mac, you can run this build using an online simulator:

1.  **Go to**: [Appetize.io](https://appetize.io/upload)
2.  **Upload**: Select the `ReignScore.tar.gz` file from your desktop.
3.  **Run**: Once processed, you will get a link to run the iOS app directly in your browser.
    *   *Note*: This allows you to verify the UI and Onboarding flow. Face ID features may be simulated or disabled depending on the cloud provider's support.

## Release Notes (Phase 4)
- **Gold Theme**: Standardized across Login, Signup, Onboarding, and Settings.
- **Biometrics**: Face ID enablement flow is fully native.
- **Push Notifications**: Integrated and permission-ready.
- **Onboarding**: "First Run" experience implemented.

## Verification Checklist
- [ ] Launch app -> Verify "Reign Over Your Credit" onboarding slides.
- [ ] Login -> Verify Face ID prompt.
- [ ] Home -> Swipe down to refresh (check haptics/theme).
- [ ] Settings -> Toggle "Face ID" on/off.

**Ready for QA.**
