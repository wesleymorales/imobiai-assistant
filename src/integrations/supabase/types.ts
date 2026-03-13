export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      calculadoras_meta: {
        Row: {
          comissao_media: number | null
          corretor_id: string
          created_at: string | null
          id: string
          renda_desejada: number | null
          resultado_json: Json | null
          taxa_conversao: number | null
          ticket_medio: number | null
          visitas_semana: number | null
        }
        Insert: {
          comissao_media?: number | null
          corretor_id: string
          created_at?: string | null
          id?: string
          renda_desejada?: number | null
          resultado_json?: Json | null
          taxa_conversao?: number | null
          ticket_medio?: number | null
          visitas_semana?: number | null
        }
        Update: {
          comissao_media?: number | null
          corretor_id?: string
          created_at?: string | null
          id?: string
          renda_desejada?: number | null
          resultado_json?: Json | null
          taxa_conversao?: number | null
          ticket_medio?: number | null
          visitas_semana?: number | null
        }
        Relationships: []
      }
      eventos_agenda: {
        Row: {
          corretor_id: string
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          google_event_id: string | null
          id: string
          imovel_id: string | null
          lead_id: string | null
          notas: string | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          corretor_id: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          google_event_id?: string | null
          id?: string
          imovel_id?: string | null
          lead_id?: string | null
          notas?: string | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          corretor_id?: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          google_event_id?: string | null
          id?: string
          imovel_id?: string | null
          lead_id?: string | null
          notas?: string | null
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_agenda_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_agenda_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      imoveis: {
        Row: {
          area_m2: number | null
          bairro: string | null
          cidade: string | null
          condominio: number | null
          corretor_id: string
          created_at: string | null
          descricao: string | null
          diferenciais: string[] | null
          endereco: string | null
          fotos_urls: string[] | null
          id: string
          preco: number | null
          quartos: number | null
          status: string | null
          tipo: string | null
          titulo: string
          vagas: number | null
        }
        Insert: {
          area_m2?: number | null
          bairro?: string | null
          cidade?: string | null
          condominio?: number | null
          corretor_id: string
          created_at?: string | null
          descricao?: string | null
          diferenciais?: string[] | null
          endereco?: string | null
          fotos_urls?: string[] | null
          id?: string
          preco?: number | null
          quartos?: number | null
          status?: string | null
          tipo?: string | null
          titulo: string
          vagas?: number | null
        }
        Update: {
          area_m2?: number | null
          bairro?: string | null
          cidade?: string | null
          condominio?: number | null
          corretor_id?: string
          created_at?: string | null
          descricao?: string | null
          diferenciais?: string[] | null
          endereco?: string | null
          fotos_urls?: string[] | null
          id?: string
          preco?: number | null
          quartos?: number | null
          status?: string | null
          tipo?: string | null
          titulo?: string
          vagas?: number | null
        }
        Relationships: []
      }
      interacoes: {
        Row: {
          corretor_id: string
          created_at: string | null
          descricao: string | null
          id: string
          lead_id: string
          objecoes: string[] | null
          tipo: string | null
        }
        Insert: {
          corretor_id: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          lead_id: string
          objecoes?: string[] | null
          tipo?: string | null
        }
        Update: {
          corretor_id?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          lead_id?: string
          objecoes?: string[] | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interacoes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          bairros: string[] | null
          como_chegou: string | null
          corretor_id: string
          cpf: string | null
          created_at: string | null
          email: string | null
          forma_pagamento: string | null
          id: string
          nome: string
          observacoes: string | null
          orcamento: number | null
          perfil: string | null
          possui_imovel_vender: boolean | null
          quartos_min: number | null
          renda_mensal_estimada: number | null
          status: string | null
          telefone: string | null
          temperatura: number | null
          tipo_imovel_preferido: string | null
          ultima_interacao: string | null
          updated_at: string | null
          urgencia: string | null
          valor_imovel_atual: number | null
        }
        Insert: {
          bairros?: string[] | null
          como_chegou?: string | null
          corretor_id: string
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          forma_pagamento?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          orcamento?: number | null
          perfil?: string | null
          possui_imovel_vender?: boolean | null
          quartos_min?: number | null
          renda_mensal_estimada?: number | null
          status?: string | null
          telefone?: string | null
          temperatura?: number | null
          tipo_imovel_preferido?: string | null
          ultima_interacao?: string | null
          updated_at?: string | null
          urgencia?: string | null
          valor_imovel_atual?: number | null
        }
        Update: {
          bairros?: string[] | null
          como_chegou?: string | null
          corretor_id?: string
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          forma_pagamento?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          orcamento?: number | null
          perfil?: string | null
          possui_imovel_vender?: boolean | null
          quartos_min?: number | null
          renda_mensal_estimada?: number | null
          status?: string | null
          telefone?: string | null
          temperatura?: number | null
          tipo_imovel_preferido?: string | null
          ultima_interacao?: string | null
          updated_at?: string | null
          urgencia?: string | null
          valor_imovel_atual?: number | null
        }
        Relationships: []
      }
      mensagens_chat: {
        Row: {
          conteudo: string
          corretor_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          conteudo: string
          corretor_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          conteudo?: string
          corretor_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cidade: string | null
          comissao_media: number | null
          created_at: string | null
          email: string | null
          foco: string[] | null
          google_calendar_connected: boolean | null
          id: string
          meta_mensal: number | null
          nome: string | null
          notif_leads_inativos: boolean | null
          notif_resumo_diario: boolean | null
          notif_visitas: boolean | null
          taxa_conversao: number | null
          telefone: string | null
          ticket_medio: number | null
          visitas_por_semana: number | null
          whatsapp_connected: boolean | null
        }
        Insert: {
          cidade?: string | null
          comissao_media?: number | null
          created_at?: string | null
          email?: string | null
          foco?: string[] | null
          google_calendar_connected?: boolean | null
          id: string
          meta_mensal?: number | null
          nome?: string | null
          notif_leads_inativos?: boolean | null
          notif_resumo_diario?: boolean | null
          notif_visitas?: boolean | null
          taxa_conversao?: number | null
          telefone?: string | null
          ticket_medio?: number | null
          visitas_por_semana?: number | null
          whatsapp_connected?: boolean | null
        }
        Update: {
          cidade?: string | null
          comissao_media?: number | null
          created_at?: string | null
          email?: string | null
          foco?: string[] | null
          google_calendar_connected?: boolean | null
          id?: string
          meta_mensal?: number | null
          nome?: string | null
          notif_leads_inativos?: boolean | null
          notif_resumo_diario?: boolean | null
          notif_visitas?: boolean | null
          taxa_conversao?: number | null
          telefone?: string | null
          ticket_medio?: number | null
          visitas_por_semana?: number | null
          whatsapp_connected?: boolean | null
        }
        Relationships: []
      }
      scripts: {
        Row: {
          conteudo: string | null
          corretor_id: string
          created_at: string | null
          id: string
          lead_id: string | null
          tipo: string | null
          tom: string | null
          usado: boolean | null
        }
        Insert: {
          conteudo?: string | null
          corretor_id: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          tipo?: string | null
          tom?: string | null
          usado?: boolean | null
        }
        Update: {
          conteudo?: string | null
          corretor_id?: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          tipo?: string | null
          tom?: string | null
          usado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_sessions: {
        Row: {
          connected_at: string | null
          corretor_id: string
          id: string
          session_data: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          connected_at?: string | null
          corretor_id: string
          id?: string
          session_data?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          connected_at?: string | null
          corretor_id?: string
          id?: string
          session_data?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
