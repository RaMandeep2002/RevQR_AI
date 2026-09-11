// lib/db/plans.js
import { createClient as createServerClient } from "@/lib/supabase/server";

// For server-side usage (API routes, server components)
export async function getPlans() {
  const supabase = await createServerClient();
  
  try {
    const { data, error } = await supabase
      .from('v_plans_with_ids')
      .select('*');
    
    if (error) {
      // Check if error is because table doesn't exist
      if (error.code === '42P01') { // PostgreSQL error code for undefined table
        console.log('Table "v_plans_with_ids" does not exist');
        return [];
      }
      throw error;
    }
    
    console.log("data -------> ", data);
    return data;
  } catch (error) {
    console.error('Error checking table:', error);
    return [];
  }
}

export async function getPlanById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getPlanByName(name: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('name', name)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getPlanByRazorpayId(razorpayPlanId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('razorpay_plan_id', razorpayPlanId)
    .single();
  
  if (error) throw error;
  return data;
}