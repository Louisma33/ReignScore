# Domain Connection Instructions

## Step 1: Remove Domain from Old Project (Critical)
Vercel is blocking the connection because `ReignScore.com` is already assigned to another project.
1. Log into **Vercel.com**.
2. Check your **Personal Account** or other **Teams**.
3. Find the old project (likely named `reignscore` or similar).
4. Go to **Settings > Domains**.
5. **Remove** `reignscore.com` and `www.reignscore.com`.

## Step 2: Update Bluehost DNS
Login to **Bluehost** and go to **DNS Management** for `ReignScore.com`.
Add these records:

| Type  | Host | Value |
| :--- | :--- | :--- |
| **A** | **@** | `76.76.21.21` |
| **CNAME** | **www** | `cname.vercel-dns.com` |

## Step 3: Connect to New Website
Once Step 1 is done, run this command in your terminal or ask me to do it:
`vercel domains add ReignScore.com`

---
**Current Website Status:**
The website is LIVE at: https://reignscore-website.vercel.app/ (or similar URL provided in the chat).
