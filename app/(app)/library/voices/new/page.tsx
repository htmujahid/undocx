import type { Metadata } from "next";
import { VoiceCreateForm } from "../_components/voice-create-form";

export const metadata: Metadata = { title: "New voice" };

export default function NewVoicePage() {
  return <VoiceCreateForm />;
}
