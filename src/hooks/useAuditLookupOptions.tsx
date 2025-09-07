import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAuditLookupOptions() {
  const { data: siteOptions = [] } = useQuery({
    queryKey: ["audit-sites"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sites")
        .select("id, site_alias")
        .eq("active", true)
        .order("site_alias");
      return data?.map(site => ({
        id: site.id,
        label: site.site_alias,
      })) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: strainOptions = [] } = useQuery({
    queryKey: ["audit-strains"],
    queryFn: async () => {
      const { data } = await supabase.from("strain").select("id, name").order("name");
      return data?.map(strain => ({ id: strain.id, name: strain.name })) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: userOptions = [] } = useQuery({
    queryKey: ["audit-users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("users")
        .select("id, full_name,email")
        .eq("active", true)
        .order("full_name");
      return data?.map(user => ({ id: user.id, name: user.full_name,email:user.email })) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

   const { data: technicianOptions = [] } = useQuery({
    queryKey: ["audit-technicians"],
    queryFn: async () => {
      const { data } = await supabase
        .from("employees")
        .select("employee_id, full_name, job_title, site_id, email, terminated, employment_status")
        .eq("employment_status", "active")
        .eq("terminated", false)
        .order("full_name");

      return data?.map(emp => ({
        id: String(emp.employee_id),
        name: emp.full_name,
        job_title: emp.job_title,
        email: emp.email,
        site_id: emp.site_id,
      })) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: batchOptions = [] } = useQuery({
    queryKey: ["audit-batches"],
    queryFn: async () => {
      const { data } = await supabase.from("batch").select("id, name").order("name");
      return data?.map(batch => ({ id: batch.id, product_name: batch.name })) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    siteOptions,
    strainOptions,
    userOptions,
    technicianOptions,
    batchOptions,
  };
}
