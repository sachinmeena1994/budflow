import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Get role and permissions for a given user in a given market
 * @param {string} userId - UUID of the user
 * @param {string} marketCode - Market code (e.g., 'IL', 'CT')
 */
async function getUserRoleAndPermissions(userId, marketCode) {
  try {
    // Step 1: Get active role mapping for the user & market
    const { data: roleMapping, error: mappingError } = await supabase
      .from('user_role_mapping')
      .select('role_id, market_code, active')
      .eq('user_id', userId)
      .eq('market_code', marketCode)
      .eq('active', true)
      .single()

    if (mappingError) throw mappingError
    if (!roleMapping) return { error: 'No active role found for this user in this market' }

    // Step 2: Get role details
    const { data: role, error: roleError } = await supabase
      .from('role')
      .select('role_id, role_code, active')
      .eq('role_id', roleMapping.role_id)
      .eq('active', true)
      .single()

    if (roleError) throw roleError

    // Step 3: Get permissions for this role
    const { data: permissions, error: permError } = await supabase
      .from('role_permission_mapping')
      .select(`
        allowed,
        active,
        permission_action:dim_permission_action (
          action_code,
          action_label,
          description,
          feature_id
        )
      `)
      .eq('role_id', role.role_id)
      .eq('active', true)
      .eq('allowed', true)

    if (permError) throw permError

    return {
      role: {
        id: role.role_id,
        code: role.role_code
      },
      permissions: permissions.map(p => ({
        action_code: p.permission_action.action_code,
        action_label: p.permission_action.action_label,
        description: p.permission_action.description,
        feature_id: p.permission_action.feature_id
      }))
    }
  } catch (err) {
    console.error('Error fetching user role and permissions:', err.message)
    return { error: err.message }
  }
}

// // Example usage:
// ;(async () => {
//   const result = await getUserRoleAndPermissions(
//     'b6b778da-8e8b-4273-b858-a5165999c27e', // user_id
//     'IL' // market_code
//   )
//   console.log(JSON.stringify(result, null, 2))
// })()
