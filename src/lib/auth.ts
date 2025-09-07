import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

type SyncUserInput = {
  sso_unique_id: string;   // stable SSO claim (required)
  email?: string | null;   // used to resolve/create employee
  full_name?: string | null; // not used for matching; optional for employee create
  user_id?: string | null; // if you mirror auth.users.id into public.users.id
};

export async function syncUserWithSupabaseV2(
  userData: SyncUserInput
): Promise<{
  sbUser: {
    active: boolean;
    created_at: string;
    id: string;
    employee_id: string;
    site_id: string | null;
    wurk_employee_id: string | null;
    email: string | null;
    full_name: string | null;
  } | null;
  error?: string;
}> {
  try {
    if (!userData.sso_unique_id) {
       throw new Error('sso_unique_id is required');
    }

    const employeeId = await resolveOrCreateEmployeeByEmail({
      email: userData.email ?? null,
      full_name: userData.full_name ?? null,
    });

    const matchCols = userData.user_id
      ? { id: userData.user_id }
      : { sso_unique_id: userData.sso_unique_id };

    const upsertPayload = {
      ...matchCols,
      sso_unique_id: userData.sso_unique_id,
      active: true,
      employee_id: employeeId,
      wurk_employee_id: employeeId,
      email: userData.email ?? null,
      full_name: userData.full_name ?? null,
    };

    const { data: upserted, error: upsertErr } = await supabase
      .from('users')
      .upsert(upsertPayload, {
        onConflict: Object.keys(matchCols),
      })
      .select(
        "id, active, created_at, employee_id, site_id, wurk_employee_id, email, full_name"
      )
      .limit(1);

    if (upsertErr) throw upsertErr;

    const row = upserted?.[0];
    if (!row) {
     throw new Error('User upsert did not return a row.');
   }

    return {
      sbUser: {
        id: row.id,
        active: row.active,
        created_at: row.created_at,
        employee_id: row.employee_id,
        site_id: row.site_id ?? null,
        wurk_employee_id: row.wurk_employee_id ?? null,
        email: row.email ?? null,
        full_name: row.full_name ?? null,
      },
    };
  } catch (err: any) {
    console.error("syncUserWithSupabaseV2 error:", err?.message || err);
    return {
      sbUser: null,
      error: err?.message || "Unknown error",
    };
  }
}

/**
 * Resolve employee by EMAIL only; if none exists, create it.
 * No full-name matching is performed (per your direction).
 */
async function resolveOrCreateEmployeeByEmail(params: {
  email: string | null;
  full_name: string | null;
}): Promise<string> {
  const { email, full_name } = params;

  if (email) {
    const { data: found, error: findErr } = await supabase
      .from('employees')
      .select('employee_id')
      .ilike('email', email) // case-insensitive match
      .limit(1)
      .maybeSingle();

 
    if (findErr) throw findErr;
    if (found?.employee_id) return found.employee_id;
         console.log("userData from Employee", found)
  }

  // Create a new employee row. You can later reconcile this ID with Wurk.
  const newEmpId = uuidv4(); // or keep TEXT semantics as desired
  const { error: insertErr } = await supabase
    .from('employees')
    .insert({
      employee_id: newEmpId,
      email: email ?? null,
      full_name: full_name ?? null,
      employment_status: 'active',
      terminated: false
    });

  if (insertErr) throw insertErr;
  return newEmpId;
}
