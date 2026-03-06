export const env = {
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  gmailUser: process.env.GMAIL_USER ?? "",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD ?? "",
  emailTo: process.env.EMAIL_TO ?? "",
  emailBcc: process.env.EMAIL_BCC ?? "",
};
