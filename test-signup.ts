import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testSignup() {
  const data = {
    email: 'test_error_' + Date.now() + '@example.com',
    password: 'password123',
    options: {
      emailRedirectTo: 'http://localhost:3000/auth/callback',
      data: {
        full_name: 'Test',
        company_id: '1234',
        role: 'Administrateur'
      }
    }
  };
  
  console.log("Attempting signup...");
  const { data: signUpData, error } = await supabase.auth.signUp(data);
  
  if (error) {
    console.log("Signup ERROR:", error);
    console.log("Error Name:", error.name);
    console.log("Error Message:", error.message);
    console.log("Error Status:", error.status);
    console.log("JSON Stringify Error:", JSON.stringify(error));
    console.log("String Error:", String(error));
  } else {
    console.log("Signup SUCCESS:", signUpData);
  }
}

testSignup();
