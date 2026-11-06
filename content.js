/* Shared brand/contact configuration. Homepage copy and media live in index.html. */
window.FOLDTYPE = {
  // Swap in an App Store Connect campaign link (…?pt=YOURID&ct=website&mt=8) to
  // count downloads from the website. Every store link and badge uses this value.
  appStoreUrl: 'https://apps.apple.com/app/id6822860496',
  supportEmail: 'foldtypesupport@gmail.com',
  logo: 'images/foldtype-logo-256.webp',

  // Penpals waitlist. Leave `action` empty to show the email-link fallback.
  // Buttondown: action 'https://buttondown.com/api/emails/embed-subscribe/USERNAME', field 'email'.
  // Kit (ConvertKit): action 'https://app.kit.com/forms/FORM_ID/subscriptions', field 'email_address'.
  penpalsForm: { action: '', emailField: 'email' },

  // Social profiles shown in the footer. Empty values are skipped.
  social: {
    YouTube: 'https://youtu.be/kWYpYqQ0f7M',
    X: '',
    Threads: '',
    Instagram: '',
    TikTok: ''
  }
};
