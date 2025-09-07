import { User } from '@/types/user';
import { getD365AccessToken, getSSOUserProfile, mockLogin, ssoLogin } from '@/utils/auth/login';
import { runByEnv } from "../../src/utils/run-by-env";
import { useMsal } from '@azure/msal-react';
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InteractionStatus } from '@azure/msal-browser';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { syncUserWithSupabaseV2 } from '@/lib/auth';

interface AuthContextType {
  user: User | null;           // Supabase "users" row
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signIn?: (email: string, password: string) => Promise<any>;
  signOut?: () => void;
  profile?: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  supabaseUser?: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // Supabase user
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { instance, accounts, inProgress } = useMsal();
  const isMsalReady = inProgress === InteractionStatus.None;
  const { toast } = useToast();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // --- Helpers ---------------------------------------------------------------

const getDisplayName = (u?: any, fb?: any) => {
  return (
    u?.full_name?.trim?.() ||
    "there"
  );
};


async function resolveExistingUserOrAttachSSO(authUser: {
  sso_unique_id: string;
  email?: string | null;
  full_name?: string | null;
}) {
  if (!authUser.sso_unique_id) throw new Error("Missing sso_unique_id");

  const emailLc = authUser.email?.trim().toLowerCase() ?? null;

  // ── 1) EMAIL FIRST ────────────────────────────────────────────────────────────
  if (emailLc) {
    const { data: sameEmailRows, error: eErr } = await supabase
      .from("users")
      .select("*")
      .ilike("email", emailLc);
    if (eErr) console.warn("Email lookup error:", eErr?.message);

    if (sameEmailRows && sameEmailRows.length > 0) {
     const withSso = sameEmailRows.find((r) => !!r.sso_unique_id);
      const primary =
        withSso ??
        sameEmailRows
          .slice()
          .sort(
            (a, b) =>
              new Date(a.created_at ?? 0).getTime() -
              new Date(b.created_at ?? 0).getTime()
          )[0];

      // Attach SSO & normalize email on the chosen primary row
      const { data: patched, error: pErr } = await supabase
        .from("users")
        .update({
          sso_unique_id: primary.sso_unique_id ?? authUser.sso_unique_id,
          email: emailLc, // normalize casing
          full_name: primary.full_name ?? authUser.full_name ?? null,
          active: true,
        })
        .eq("id", primary.id)
        .select()
        .maybeSingle();

      if (pErr) {
        console.error("Failed to attach SSO to existing email row:", pErr);
        // IMPORTANT: do NOT create a new row; return the primary to avoid dupes
        return primary;
      }

      // Deactivate other duplicate rows for this same email (optional)
      const others = sameEmailRows.filter((r) => r.id !== primary.id);
      if (others.length) {
        try {
          await supabase
            .from("users")
            .update({ active: false })
            .in(
              "id",
              others
                // Only deactivate rows that do NOT have this SSO
                .filter((r) => r.sso_unique_id !== authUser.sso_unique_id)
                .map((r) => r.id)
            );
        } catch (deactErr) {
          console.warn("Could not deactivate duplicates:", deactErr);
        }
      }

      return patched ?? primary;
    }
  }

  // ── 2) SSO lookup (only if no email match found) ─────────────────────────────
  const { data: bySso, error: sErr } = await supabase
    .from("users")
    .select("*")
    .eq("sso_unique_id", authUser.sso_unique_id)
    .limit(1)
    .maybeSingle();
  if (sErr) console.warn("SSO lookup error:", sErr?.message);

  if (bySso) {
    // Normalize email on the SSO row if needed
    if (emailLc && (bySso.email ?? "").toLowerCase() !== emailLc) {
      const { data: upd } = await supabase
        .from("users")
        .update({ email: emailLc })
        .eq("id", bySso.id)
        .select()
        .maybeSingle();
      return upd ?? { ...bySso, email: emailLc };
    }
    return bySso;
  }

  // ── 3) Truly new: create one (your existing creator) ─────────────────────────
  const created = await syncUserWithSupabase({
    sso_unique_id: authUser.sso_unique_id,
    email: emailLc,
    full_name: authUser.full_name ?? null,
  });
  return created;
}



 const syncUserWithSupabase = async (userData: Partial<User> & { sso_unique_id?: string }) => {
  try {
    const result = await syncUserWithSupabaseV2({
      sso_unique_id: userData.sso_unique_id || "",
      email: userData.email ? userData.email.toLowerCase() : null, 
      full_name: (userData as any).full_name || (userData as any).name || null,
      user_id: (userData as any).id || null,
    });

    if (result.error) {
      console.error("syncUserWithSupabaseV2 failed:", result.error);
      toast({
        title: "Profile sync issue",
        description: "Error Occurred in Sign up.",
        variant: "destructive",
      });
      return null;
    }

    return result.sbUser;
  } catch (err) {
    console.error("Failed to sync user (outer catch):", err);
    toast({
      title: "Profile sync issue",
      description: "Error Occurred in Sign up.",
      variant: "destructive",
    });
    return null;
  }
};


  // --- Bootstrap on app load / reload ---------------------------------------
  // IMPORTANT: No Supabase calls unless MSAL has an account (live) OR we’re in mock.
  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      try {
        await runByEnv({
          // Live: only proceed if MSAL is fully ready AND we already have an account
          onLiveENVs: async () => {
            if (!isMsalReady) return; // wait until MSAL settles; we'll rerun due to deps
            if (accounts.length === 0) {
              // No account -> not logged in; stop loading but don't navigate away
              if (mountedRef.current) {
                setUser(null);
                setSupabaseUser(null);
              }
              return;
            }

            // Has account (returning session) -> hydrate Supabase user now
            const account = accounts[0];
            let ssoProfile: any;
            try {
              ssoProfile = await getSSOUserProfile(instance, account);
            } catch (e) {
              console.warn("Could not retrieve SSO profile on bootstrap:", e);
              // If we can’t get SSO profile, treat as signed out
              if (mountedRef.current) {
                setUser(null);
                setSupabaseUser(null);
              }
              return;
            }
let sbUser = await resolveExistingUserOrAttachSSO({
  sso_unique_id: ssoProfile?.sso_unique_id,
  email: ssoProfile?.email ?? null,
  full_name: ssoProfile?.name ?? null,
});

            if (!sbUser) {
              sbUser = await syncUserWithSupabase({
                full_name: ssoProfile?.name,
                email: ssoProfile?.email,
                sso_unique_id: ssoProfile?.sso_unique_id
              });
            }

            if (mountedRef.current) {
              setUser(sbUser);
              setSupabaseUser(sbUser);
            }

            // Best-effort D365 token, but don't block
            try {
              await getD365AccessToken(instance, account);
            } catch (error) {
              console.error('Error acquiring D365 token (bootstrap):', error);
            }
          },

          // Mock: restore local user if present; no Supabase calls until login
          onMockENVs: async () => {
            const storedUser = localStorage.getItem('user');
            if (mountedRef.current) {
              setUser(storedUser ? JSON.parse(storedUser) : null);
              setSupabaseUser(storedUser ? JSON.parse(storedUser) : null);
            }
          },
        });
      } catch (error) {
        console.error('Error during bootstrap auth:', error);
        // Don’t force redirect here; let routes decide based on isAuthenticated
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    };

    bootstrap();
    // Re-run when MSAL readiness or accounts list changes
  }, [accounts, instance, isMsalReady]);

  // --- Cross-tab logout sync -------------------------------------------------
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'app-logout') {
        setUser(null);
        setSupabaseUser(null);
        navigate('/login');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  // --- Explicit Login flow (user action) ------------------------------------
const login = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    const authUser = await runByEnv({
      onLiveENVs: async () => {
        try {
          return await ssoLogin(instance);
        } catch (err) {
          console.warn("SSO login failed; falling back to mock login for this environment.");
          return await mockLogin(email, password);
        }
      },
      onMockENVs: async () => {
        return await mockLogin(email, password);
      },
    });

    const normalizedEmail = authUser.email?.toLowerCase();

    // --- Lookup in Supabase ---
   let sbUser = await resolveExistingUserOrAttachSSO({
  sso_unique_id: authUser.sso_unique_id,
  email: normalizedEmail,
  full_name: authUser.name ?? null,
});
    if (!sbUser) {
      sbUser = await syncUserWithSupabase({
        ...authUser,
        email: normalizedEmail,   // force lowercase
      });
    }

    const who = getDisplayName(sbUser, authUser);
    if (mountedRef.current) {
      setUser(sbUser);
      setSupabaseUser(sbUser);

      toast({
        title: "Logged in successfuly",
        description: `Welcome, ${who}!`,
        variant: "default",
        duration: 1000,
      });
    }

    navigate("/productivity");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  } finally {
    if (mountedRef.current) setIsLoading(false);
  }
};

  const logout = () => {
    // No async; clear locally and broadcast
    runByEnv({
      onOTCENVs: () => {
        if (accounts) {
          instance.clearCache();
        }
        localStorage.setItem('app-logout', Date.now().toString());
      },
      onLovableENVs: () => localStorage.removeItem('user'),
    });

    setUser(null);
    setSupabaseUser(null);
    navigate('/login');
  };

  const value = {
    user,
    supabaseUser,
    login,
    logout,
    signIn: login,
    signOut: logout,
    profile: user,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
