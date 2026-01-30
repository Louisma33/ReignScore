# ReignScore Deployment Guide (v1.1)

## 1. Backend API (Render.com)

1.  **Commit & Push**: Ensure all changes are committed and pushed to your GitHub repository.
    ```bash
    git push origin main
    ```
2.  **Environment Variables**: Go to your Render Dashboard -> Services -> ReignScore API -> Environment.
    *   Add `STRIPE_SECRET_KEY`: `sk_test_...` (Your Stripe Secret Key)
    *   Add `PLASTIQ_API_KEY`: `...` (Your Plastiq Key if available)
3.  **Deploy**: Render should auto-deploy on push. If not, click "Manual Deploy" -> "Deploy latest commit".

## 2. Mobile App (Expo / EAS)

1.  **Install EAS CLI** (if not installed):
    ```bash
    npm install -g eas-cli
    ```
2.  **Login**:
    ```bash
    eas login
    ```
3.  **Build for Production (Store)**:
    This creates the strict production build connecting to the live server.
    ```bash
    eas build --profile production --platform all
    ```
4.  **Build for Preview (Device Testing)**:
    This creates a build you can install on your phone to test the "Production" environment.
    ```bash
    eas build --profile preview --platform ios
    ```

## 3. Web Deployment (Vercel / Netlify)

1.  **Build Web Bundle**:
    ```bash
    npx expo export
    ```
2.  **Deploy**:
    Run the deploy command for your preferred provider (e.g., `vercel deploy` or `netlify deploy`) pointing to the `dist` folder.
    
## 4. Verification

After deployment, perform these "Smoke Tests":
1.  **Login**: Can users log in? (Verifies Database connection).
2.  **Subscription**: Go to Settings -> Upgrade. Does the checkout link open? (Verifies Stripe/Env Vars).
3.  **Simulator**: Run a simulation? (Verifies API Logic).

**Current Version**: 1.1.0 (Noble Release)
