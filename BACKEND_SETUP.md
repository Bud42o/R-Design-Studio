# Serverless Email Backend Setup

Your contact form is now configured to use a Vercel serverless function with Resend for email delivery. Here's how to set it up:

## Step 1: Deploy to Vercel (5 minutes)

### Option A: Using GitHub (Recommended)
1. Push your project to GitHub (if not already done) ✓
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click **Add New...** → **Project**
4. Import your GitHub repository
5. Vercel will auto-detect it as a project with `/api` functions
6. Click **Deploy**

### Option B: Manual Deploy
1. Install Vercel CLI: `npm i -g vercel`
2. In your project directory, run: `vercel`
3. Follow the prompts

## Step 2: Set Up Resend API Key (3 minutes)

1. Go to [resend.com](https://resend.com) and sign up
2. Create a new API key in the dashboard
3. In Vercel dashboard for your project:
   - Go to **Settings** → **Environment Variables**
   - Add a new variable:
     - Name: `RESEND_API_KEY`
     - Value: `your-resend-api-key-here`
   - Click **Save**
   - **Important:** Redeploy after adding env vars (or just push a new commit)

## Step 3: Configure Resend Domain (10 minutes)

To send emails from `noreply@rdesigns.pro`, you need to verify your domain in Resend.

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter `rdesigns.pro`
4. Resend will show you DNS records to add
5. Go to your **Hostinger** control panel:
   - Navigate to **DNS Settings** for rdesigns.pro
   - Add the DNS records provided by Resend (DKIM, SPF, MX)
   - **This takes 5-30 minutes to propagate**

Once verified, emails will send from `noreply@rdesigns.pro` with reply-to pointing to the visitor's email.

## Step 4: Update Your Frontend (Already Done ✓)

The form in `index.html` is already configured to:
- POST to `https://rdesigns.pro/api/send-email`
- Send JSON data with name, email, service, and message
- Display success/error messages

No further changes needed.

## Step 5: Test It

1. Fill out the contact form on your website
2. You should receive an email at `contact@rdesigns.pro`
3. The visitor should receive an auto-reply email

## Environment Variables Summary

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
ALLOWED_ORIGIN=https://rdesigns.pro
```

(Optional: If you add ALLOWED_ORIGIN, only requests from that domain will be accepted)

## Troubleshooting

### Email not arriving
- Check spam/junk folder
- Verify domain is confirmed in Resend dashboard
- Check Resend dashboard logs for any errors

### Form says "Failed to send"
- Check browser console (F12 → Console tab) for error details
- Verify environment variable is set in Vercel
- Ensure you redeployed after adding environment variables

### Getting "Method not allowed" error
- The serverless function might not have deployed
- Try pushing a new commit to trigger a redeploy

## Email Template Details

**Business Email (to contact@rdesigns.pro):**
- Shows visitor's name, email, service type, and message
- Links to visitor's email for easy reply

**Auto-Reply (to visitor):**
- Confirms receipt
- Gives 24-hour response time expectation
- Includes WhatsApp and email contact options

## Security Features Included

✅ Honeypot field to catch bots
✅ Client-side minimum fill time (1.5 seconds)
✅ Message length limit (5000 chars)
✅ Email validation
✅ CORS origin check
✅ HTML escaping to prevent injection
✅ Error handling and logging

## Cost

**Resend:** Free for up to 100 emails/day. $20/month for unlimited.
**Vercel:** Free for hobby projects. Function invocations included.

Your contact form will cost essentially nothing with normal traffic levels.

## Need Help?

- Resend docs: https://resend.com/docs
- Vercel docs: https://vercel.com/docs
- Hostinger DNS help: Check their support dashboard
