import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function resetDb() {
  try {
    console.log("Suppression des settings...");
    await supabaseAdmin.from('settings').delete().not('id', 'is', null);
    
    console.log("Suppression des profiles...");
    await supabaseAdmin.from('profiles').delete().not('id', 'is', null);
    
    console.log("Suppression des companies...");
    await supabaseAdmin.from('companies').delete().not('id', 'is', null);

    console.log("Récupération des utilisateurs...");
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Erreur récupération users:", usersError);
    } else if (users) {
      console.log(`Suppression de ${users.length} utilisateurs...`);
      for (const user of users) {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (error) console.error(`Erreur suppression user ${user.email}:`, error);
      }
    }

    console.log("Base de données réinitialisée avec succès !");
  } catch (err) {
    console.error("Erreur critique:", err);
  }
}

resetDb();
