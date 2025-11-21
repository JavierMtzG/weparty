import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 4000,
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
};
