export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string; email: string; phone: string | null; role: 'student' | 'restaurant' | 'driver' | 'admin'; university: string | null; created_at: string }
        Insert: { id: string; full_name: string; email: string; phone?: string | null; role?: 'student' | 'restaurant' | 'driver' | 'admin'; university?: string | null; created_at?: string }
        Update: { id?: string; full_name?: string; email?: string; phone?: string | null; role?: 'student' | 'restaurant' | 'driver' | 'admin'; university?: string | null; created_at?: string }
        Relationships: []
      }
      restaurants: {
        Row: { id: string; name: string; description: string | null; image_url: string | null; address: string | null; latitude: number | null; longitude: number | null; rating: number; delivery_fee: number; estimated_delivery_minutes: number; is_active: boolean; created_at: string }
        Insert: { id?: string; name: string; description?: string | null; image_url?: string | null; address?: string | null; latitude?: number | null; longitude?: number | null; rating?: number; delivery_fee?: number; estimated_delivery_minutes?: number; is_active?: boolean; created_at?: string }
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>
        Relationships: []
      }
      categories: {
        Row: { id: string; name: string; image_url: string | null }
        Insert: { id?: string; name: string; image_url?: string | null }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
        Relationships: []
      }
      menu_items: {
        Row: { id: string; restaurant_id: string; category_id: string | null; name: string; description: string | null; price: number; image_url: string | null; is_available: boolean; created_at: string }
        Insert: { id?: string; restaurant_id: string; category_id?: string | null; name: string; description?: string | null; price: number; image_url?: string | null; is_available?: boolean; created_at?: string }
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>
        Relationships: []
      }
      orders: {
        Row: { id: string; customer_id: string; restaurant_id: string; driver_id: string | null; order_type: 'normal' | 'group'; status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'; subtotal: number; delivery_fee: number; total: number; delivery_address: string; latitude: number | null; longitude: number | null; scheduled_for: string | null; created_at: string }
        Insert: { id?: string; customer_id: string; restaurant_id: string; driver_id?: string | null; order_type?: 'normal' | 'group'; status?: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'; subtotal: number; delivery_fee?: number; delivery_address: string; latitude?: number | null; longitude?: number | null; scheduled_for?: string | null; created_at?: string }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
        Relationships: []
      }
      order_items: {
        Row: { id: string; order_id: string; menu_item_id: string; quantity: number; unit_price: number; total_price: number }
        Insert: { id?: string; order_id: string; menu_item_id: string; quantity: number; unit_price: number }
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
        Relationships: []
      }
      group_orders: {
        Row: { id: string; restaurant_id: string; creator_id: string; area: string; max_participants: number; current_participants: number; current_delivery_fee: number; target_delivery_fee: number; closes_at: string; status: 'open' | 'closed' | 'in_progress' | 'completed' | 'cancelled'; created_at: string }
        Insert: { id?: string; restaurant_id: string; creator_id: string; area: string; max_participants: number; current_participants?: number; current_delivery_fee?: number; target_delivery_fee: number; closes_at: string; status?: 'open' | 'closed' | 'in_progress' | 'completed' | 'cancelled'; created_at?: string }
        Update: Partial<Database['public']['Tables']['group_orders']['Insert']>
        Relationships: []
      }
      group_order_participants: {
        Row: { id: string; group_order_id: string; user_id: string; order_id: string | null; joined_at: string }
        Insert: { id?: string; group_order_id: string; user_id: string; order_id?: string | null; joined_at?: string }
        Update: Partial<Database['public']['Tables']['group_order_participants']['Insert']>
        Relationships: []
      }
      drivers: {
        Row: { id: string; profile_id: string; vehicle_type: string | null; is_available: boolean; current_latitude: number | null; current_longitude: number | null }
        Insert: { id?: string; profile_id: string; vehicle_type?: string | null; is_available?: boolean; current_latitude?: number | null; current_longitude?: number | null }
        Update: Partial<Database['public']['Tables']['drivers']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: { user_role: 'student' | 'restaurant' | 'driver' | 'admin'; order_type: 'normal' | 'group'; order_status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'; group_order_status: 'open' | 'closed' | 'in_progress' | 'completed' | 'cancelled' }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
