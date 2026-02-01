# ReignScore - Feature Release 1.1.0 Handover

## Overview
ReignScore has been upgraded with **Monetization (Phase 5)** and **Differentiation (Phase 6)** features. This release introduces subscription tiers, credit simulators, and gamification challenges.

## 🚀 New Features
### 1. Noble Membership (Subscriptions)
- **Integration**: Stripe-powered checkout flow.
- **UI**: Premium "Reign Noble" upgrade screen using Gold theme.
- **Backend**: `subscriptions` table and API endpoints (`/subscriptions/create-checkout-session`).

### 2. Reign Score Simulator
- **Functionality**: Simulate credit actions (Pay Debt, Open Card) to see potential score impact.
- **Logic**: Intelligent heuristic model that adapts based on current score range (High/Low score tiers).
- **UI**: Interactive input and result visualization.

### 3. Crown Challenges (Gamification)
- **Concept**: Earn points by completing financial health tasks.
- **Content**: 5 seeded challenges (e.g., "Utilization Master", "Debt Destroyer").
- **UI**: Challenges list with "Join" status tracking.

## 🛠 Technical Updates
- **Database**: Added `subscriptions`, `challenges`, and `user_challenges` tables.
- **Plaid**: Fixed TypeScript definitions for Web/Native compatibility.
- **Environment**: Updated `eas.json` with Production & Preview profiles for Stripe keys.
- **Version**: Bumped to `1.1.0`.

## 📦 Deployment Instructions
1.  **Database**: Ensure migrations are run on production DB.
    ```bash
    npm run migrate
    ```
2.  **Environment Variables**:
    - Add `STRIPE_SECRET_KEY` to the server environment (Render).
    - Add `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` to build environment (EAS).
3.  **Build**:
    ```bash
    eas build --profile production
    ```

## ✅ Verification Checklist
- [x] Subscription screen loads and initiates Stripe Link.
- [x] Simulator calculates positive/negative score changes correctly.
- [x] Challenges list is populated and 'Join' updates UI.
- [x] Settings menu links to all new tools.
- [x] System health check passed (Expo Doctor).

**Ready for Production Deployment.**

## 📥 Production Build Artifacts (v1.1.0)
- **Android (.aab)**: [Download Link](https://expo.dev/artifacts/eas/2qG3Ncne51sfSdeX6N4nBe.aab) - *Ready for Google Play*
- **iOS (.ipa)**: [Download Link](https://expo.dev/artifacts/eas/k4YjHj2GsSnK2Xh7LHBUNr.ipa) - *Ready for TestFlight*

