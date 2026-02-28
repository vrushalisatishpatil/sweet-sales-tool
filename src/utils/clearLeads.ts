import { supabase } from "@/lib/supabase";

/**
 * Utility function to delete all leads from the database
 * Run this once to clear all lead data
 */
export const clearAllLeads = async () => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
      console.error('Error deleting leads:', error);
      return { success: false, error: error.message };
    }

    console.log('All leads deleted successfully');
    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: String(err) };
  }
};

// Uncomment the line below and run this file directly to clear all leads
// clearAllLeads().then(result => console.log('Result:', result));
