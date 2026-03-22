# Hostinger DNS Configuration for Resend

After you verify your domain in Resend, you'll need to add DNS records to Hostinger. Here's where to add them:

## Steps in Hostinger

1. Log into **Hostinger** control panel
2. Go to **Domains** → **rdesigns.pro**
3. Click **Manage** → **DNS Zone**
4. Scroll to the table showing existing records

## DNS Records to Add

Resend will provide you with 3 records. Add each one:

### Record Type: TXT (for SPF)
```
Name/Host: @
Type: TXT
Value: v=spf1 include:resend.com ~all
TTL: 3600
```

### Record Type: CNAME (for DKIM)
```
Name/Host: [key]._domainkey.rdesigns.pro (Resend gives you the exact [key])
Type: CNAME
Value: [value].dkim.resend.com (Resend gives you the exact value)
TTL: 3600
```

### Record Type: MX (Optional, for receiving replies)
```
Name/Host: @
Type: MX
Priority: 10
Value: feedback-smtp.rdesigns.pro
TTL: 3600
```

## Propagation Time

- SPF/TXT: 5-30 minutes usually
- DKIM/CNAME: 10 minutes to several hours
- Check Resend dashboard to confirm when verified ✓

## Double-Check

Before sending test emails:
1. Wait until all records show ✓ (verified) in Resend dashboard
2. For SPF: Make sure your existing Hostinger SPF records don't conflict
   - If you already have an SPF record, edit it to: `v=spf1 include:resend.com include:hostinger.com ~all`

## Your Business Email Still Works

Your existing contact@rdesigns.pro mailbox continues to work normally:
- Emails from Resend will arrive in your Hostinger inbox
- Replies from visitors go to their email (since Reply-To is set)
- No need to change Hostinger email hosting

## Resend Domain Verification

1. After adding DNS records, go to Resend dashboard
2. Find your domain in the Domains list
3. Click to view verification status
4. It should show all records as ✓ Verified once DNS propagates
5. Once verified, you can send from `noreply@rdesigns.pro`

## Test the Setup

1. Fill out contact form on your site
2. Check that email arrives at contact@rdesigns.pro
3. Check Resend dashboard **Emails** tab to confirm delivery
4. If failed, click on the email to see the error details

## Hostinger Support

If you need help with DNS:
- Log into Hostinger
- Click **Help** → **Chat with Support**
- They're usually quick to help with DNS issues
