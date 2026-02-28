// Supabase Database Types

export type LeadStatus =
  | "New"
  | "Connected"
  | "Interested"
  | "Not Interested"
  | "Detail Share"
  | "Re-connected"
  | "Negotiation"
  | "Converted"
  | "Irrelevant"
  | "Lost";

export type TaskPriority = "High" | "Medium" | "Low" | "Urgent";
export type TaskStatus = "Pending" | "In Progress" | "Completed";
export type TodoStatus = "Pending" | "In Progress" | "Completed";

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          lead_id: string;
          company: string;
          contact: string;
          phone: string | null;
          email: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          source: string | null;
          product_interested: string | null;
          assigned_to: string | null;
          status: LeadStatus;
          value: number;
          remarks: string | null;
          inquiry_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          company: string;
          contact: string;
          phone?: string | null;
          email?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          source?: string | null;
          product_interested?: string | null;
          assigned_to?: string | null;
          status?: LeadStatus;
          value?: number;
          remarks?: string | null;
          inquiry_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          company?: string;
          contact?: string;
          phone?: string | null;
          email?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          source?: string | null;
          product_interested?: string | null;
          assigned_to?: string | null;
          status?: LeadStatus;
          value?: number;
          remarks?: string | null;
          inquiry_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          task_id: string;
          title: string;
          description: string | null;
          assigned_to: string | null;
          priority: TaskPriority;
          status: TaskStatus;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          title: string;
          description?: string | null;
          assigned_to?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          title?: string;
          description?: string | null;
          assigned_to?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          title: string;
          content: string | null;
          status: TodoStatus;
          company: string | null;
          created_by: string;
          owner_identifier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string | null;
          status?: TodoStatus;
          company?: string | null;
          created_by: string;
          owner_identifier: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string | null;
          status?: TodoStatus;
          company?: string | null;
          created_by?: string;
          owner_identifier?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales_team: {
        Row: {
          id: string;
          person_id: string;
          name: string;
          email: string;
          phone: string;
          password: string;
          leads_assigned: number;
          conversions: number;
          avatar: string | null;
          status: "Active" | "Inactive";
          leads: number;
          converted: number;
          rate: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          name: string;
          email: string;
          phone: string;
          password: string;
          leads_assigned?: number;
          conversions?: number;
          avatar?: string | null;
          status?: "Active" | "Inactive";
          leads?: number;
          converted?: number;
          rate?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          password?: string;
          leads_assigned?: number;
          conversions?: number;
          avatar?: string | null;
          status?: "Active" | "Inactive";
          leads?: number;
          converted?: number;
          rate?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          company: string;
          pincode: string | null;
          state: string | null;
          main_area: string | null;
          sub_areas: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company: string;
          pincode?: string | null;
          state?: string | null;
          main_area?: string | null;
          sub_areas?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company?: string;
          pincode?: string | null;
          state?: string | null;
          main_area?: string | null;
          sub_areas?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
