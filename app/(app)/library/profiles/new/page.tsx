import type { Metadata } from "next";
import { ProfileForm } from "../_components/profile-form";

export const metadata: Metadata = { title: "New writer profile" };

export default function NewProfilePage() {
  return <ProfileForm />;
}
