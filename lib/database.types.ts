export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null;
          email: string | null;
          id: string;
          name: string;
          picture_url: string | null;
          public_data: Json;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          picture_url?: string | null;
          public_data?: Json;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          picture_url?: string | null;
          public_data?: Json;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          content: string;
          created_at: string | null;
          document_id: string;
          id: string;
          is_resolved: boolean | null;
          parent_comment_id: string | null;
          position: Json | null;
          quote_text: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          document_id: string;
          id?: string;
          is_resolved?: boolean | null;
          parent_comment_id?: string | null;
          position?: Json | null;
          quote_text?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          document_id?: string;
          id?: string;
          is_resolved?: boolean | null;
          parent_comment_id?: string | null;
          position?: Json | null;
          quote_text?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey";
            columns: ["parent_comment_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          content: Json | null;
          created_at: string;
          id: string;
          is_public: boolean;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content?: Json | null;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          title?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: Json | null;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      shared_documents: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level_enum"];
          created_at: string;
          document_id: string;
          email: string | null;
          id: string;
          shared_by: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level_enum"];
          created_at?: string;
          document_id: string;
          email?: string | null;
          id?: string;
          shared_by: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          access_level?: Database["public"]["Enums"]["access_level_enum"];
          created_at?: string;
          document_id?: string;
          email?: string | null;
          id?: string;
          shared_by?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shared_documents_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      starred_documents: {
        Row: {
          created_at: string;
          document_id: string;
          id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          document_id: string;
          id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          document_id?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "starred_documents_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      trashed_documents: {
        Row: {
          content: Json | null;
          created_at: string;
          id: string;
          title: string;
          trashed_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content?: Json | null;
          created_at: string;
          id: string;
          title: string;
          trashed_at?: string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          content?: Json | null;
          created_at?: string;
          id?: string;
          title?: string;
          trashed_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_pending_invitations: { Args: never; Returns: number };
      get_comments_with_users: {
        Args: { p_document_id: string };
        Returns: {
          content: string;
          created_at: string;
          document_id: string;
          id: string;
          is_resolved: boolean;
          parent_comment_id: string;
          position: Json;
          quote_text: string;
          updated_at: string;
          user_email: string;
          user_id: string;
          user_name: string;
          user_picture_url: string;
          user_public_data: Json;
        }[];
      };
      get_my_documents_with_users: {
        Args: never;
        Returns: {
          content: Json;
          created_at: string;
          id: string;
          is_public: boolean;
          title: string;
          updated_at: string;
          user_email: string;
          user_id: string;
          user_name: string;
          user_picture_url: string;
          user_public_data: Json;
        }[];
      };
      get_shared_documents_with_users: {
        Args: never;
        Returns: {
          access_level: string;
          content: Json;
          created_at: string;
          id: string;
          is_public: boolean;
          title: string;
          updated_at: string;
          user_email: string;
          user_id: string;
          user_name: string;
          user_picture_url: string;
          user_public_data: Json;
        }[];
      };
      get_starred_documents_with_users: {
        Args: never;
        Returns: {
          content: Json;
          created_at: string;
          id: string;
          is_public: boolean;
          starred_at: string;
          title: string;
          updated_at: string;
          user_email: string;
          user_id: string;
          user_name: string;
          user_picture_url: string;
          user_public_data: Json;
        }[];
      };
      get_trashed_documents_with_users: {
        Args: never;
        Returns: {
          content: Json;
          created_at: string;
          id: string;
          title: string;
          trashed_at: string;
          updated_at: string;
          user_email: string;
          user_id: string;
          user_name: string;
          user_picture_url: string;
          user_public_data: Json;
        }[];
      };
      permanently_delete_document: {
        Args: { p_document_id: string };
        Returns: undefined;
      };
      restore_document: { Args: { p_document_id: string }; Returns: undefined };
      trash_document: { Args: { p_document_id: string }; Returns: undefined };
    };
    Enums: {
      access_level_enum: "view" | "comment" | "edit";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      access_level_enum: ["view", "comment", "edit"],
    },
  },
} as const;
