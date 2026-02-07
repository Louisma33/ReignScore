# App Store Connect - Review Status & Requirements Guide

## How to Check Your App Status

Since the automated browser access is unavailable, please follow these steps manually:

### 1. Login to App Store Connect
- Go to: https://appstoreconnect.apple.com
- Sign in with your Apple Developer account

### 2. Navigate to Your App
- Click "My Apps" in the dashboard
- Select "ReignScore" from the list

### 3. Check Build Status
Look for the status in the app details page:

| Status | Meaning |
|--------|---------|
| **Waiting for Review** | Build is in queue, typically 24-48 hours |
| **In Review** | Apple is actively reviewing your app |
| **Pending Developer Release** | Approved! Ready for you to release |
| **Ready for Sale** | App is live on the App Store |
| **Rejected** | Issues found - check Resolution Center |

---

## Common Review Requirements Checklist

### ✅ App Information
- [ ] App Name: "ReignScore - Credit Optimizer"
- [ ] Subtitle: "Build Your Credit Kingdom"
- [ ] Privacy Policy URL: https://reignscore.com/privacy
- [ ] Support URL: https://reignscore.com/support
- [ ] Marketing URL: https://reignscore.com

### ✅ Screenshots Required
| Device | Required Sizes |
|--------|----------------|
| iPhone 6.7" | 1290 x 2796 px (iPhone 15 Pro Max) |
| iPhone 6.5" | 1242 x 2688 px (iPhone 11 Pro Max) |
| iPhone 5.5" | 1242 x 2208 px (iPhone 8 Plus) |
| iPad Pro 12.9" | 2048 x 2732 px (if supporting iPad) |

**Required Screenshots (6 minimum):**
1. Dashboard with credit score
2. Score Simulator in action
3. 7-Day Rule payment reminder
4. Reign Guard credit monitoring
5. Crowns & Rewards gamification
6. Premium plans (Noble/Emperor)

### ✅ App Review Information
- [ ] Demo account credentials provided
- [ ] Contact information for reviewer
- [ ] Notes explaining any special features

### ✅ Content & Privacy
- [ ] Age rating questionnaire completed
- [ ] Privacy policy URL active
- [ ] Data collection practices disclosed
- [ ] Third-party SDKs listed (Stripe, PostHog, Sentry)

### ✅ In-App Purchases (if applicable)
- [ ] Noble Plan ($4.99/month) - configured
- [ ] Emperor Plan ($14.99/month) - configured
- [ ] Subscription terms clearly displayed
- [ ] Restore purchases functionality working

---

## Common Rejection Reasons to Avoid

### 1. Guideline 2.1 - App Completeness
**Issue:** Placeholder content or incomplete features
**Our Status:** ✅ All features functional

### 2. Guideline 4.2 - Minimum Functionality
**Issue:** App is too simple or web wrapper
**Our Status:** ✅ Native features, unique functionality

### 3. Guideline 5.1.1 - Data Collection
**Issue:** Privacy policy missing or incomplete
**Our Status:** ✅ Privacy policy at reignscore.com/privacy

### 4. Guideline 3.1.1 - In-App Purchase
**Issue:** External payment links
**Our Status:** ✅ Using Apple's in-app purchase system

### 5. Guideline 2.3.7 - Accurate Metadata
**Issue:** Screenshots don't match actual app
**Our Status:** ✅ Screenshots from actual app

---

## Typical Review Timeline

| Submission Type | Expected Time |
|-----------------|---------------|
| First submission | 24-48 hours |
| Update submission | 12-24 hours |
| Expedited review (requested) | 1-2 hours |

---

## If Your App Gets Rejected

1. **Check Resolution Center** in App Store Connect
2. **Read the specific guideline** mentioned
3. **Fix the issue** in the next build
4. **Bump build number** (current: 23, next would be 24)
5. **Resubmit** with notes explaining the fix

---

## Contact Information for Apple

- App Review Board: https://developer.apple.com/contact/app-store/
- Developer Support: https://developer.apple.com/support/

---

## Your Current Submission

**App:** ReignScore
**Version:** 1.1.0
**Build:** 23
**Status:** Submitted to App Store Connect (as of 2026-02-06)
**IPA:** https://expo.dev/artifacts/eas/jxqcMrW8Q6bwwtouGy2nKL.ipa

Please check App Store Connect for the latest status!
