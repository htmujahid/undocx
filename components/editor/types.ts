import { Json } from "@/lib/database.types";

export type Comments = {
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
};
