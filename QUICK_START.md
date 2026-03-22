# Quick Start Checklist

Complete these steps in order to get your contact form working:

## Phase 1: Prepare Code (Already Done ✓)
- [x] HTML form updated to send JSON
- [x] JavaScript handler redirects to new endpoint
- [x] Serverless function created at `/api/send-email.js`
- [x] Package.json with Resend dependency created
- [x] Environment variable template created

## Phase 2: Deploy to Vercel

- [x] **Code pushed to GitHub** ✓

- [ ] **Create Vercel account** at https://vercel.com (sign up with GitHub)

- [ ] **Deploy project**
  - Go to vercel.com/new
  - Import your GitHub repo (R-Design-Studio)
  - Click Deploy
  - Wait for deployment ✓

## Phase 3: Connect Resend

- [ ] **Create Resend account** at https://resend.com

- [ ] **Generate API key**
  - Go to https://resend.com/api-keys
  - Create new key
  - Copy the API key

- [ ] **Add environment variable to Vercel**
  - In Vercel dashboard, go to Settings → Environment Variables
  - Add: `RESEND_API_KEY` = `your-api-key`
  - Save

- [ ] **Redeploy** (push a new commit or manually redeploy in Vercel)

## Phase 4: Verify Domain in Resend

- [ ] **Add domain in Resend**
  - Go to Resend dashboard → Domains
  - Click "Add Domain"
  - Enter: `rdesigns.pro`
  - Copy the DNS records shown

- [ ] **Add DNS records to Hostinger**
  - Log into Hostinger
  - Go to Domains → rdesigns.pro → Manage → DNS Zone
  - Add each record Resend provided:
    - SPF (TXT record)
    - DKIM (CNAME record)
    - (Optional) MX record
  - See `HOSTINGER_DNS_SETUP.md` for details

- [ ] **Wait for DNS propagation** (5-30 minutes)

- [ ] **Verify in Resend**
  - Check Resend dashboard for ✓ marks next to each record
  - Once all verified, you're ready!

## Phase 5: Test

- [ ] **Test form submission**
  - Go to your website
  - Fill out contact form
  - Submit

- [ ] **Check email delivery**
  - Check contact@rdesigns.pro inbox (might be in spam first time)
  - Verify you received the lead info

- [ ] **Check auto-reply**
  - The visitor should get an auto-reply email

- [ ] **Check Resend logs**
  - Go to Resend dashboard → Emails
  - See all emails sent with status

## Need Help?

- **Contact form not sending**: Check browser Console (F12) for errors
- **Email not arriving**: Check Resend Emails tab for failure reason
- **DNS issues**: See `HOSTINGER_DNS_SETUP.md`
- **Deployment issues**: See `BACKEND_SETUP.md`

---

**Total time:** ~30 minutes (mostly waiting for DNS propagation)

Once complete, your contact form will send emails directly without any third-party service limitation!
