import { notFound } from "next/navigation";
import { getCurrentUser } from "~@/lib/auth/session";
import { findProfile } from "~@/lib/db/repository/profile";
import { ProfileForm } from "./profile-form";

export async function ProfileContent({ id }: { id: string }) {
  const profile = await findProfile((await getCurrentUser()).id, id);
  if (!profile) notFound();
  return <ProfileForm key={profile.id} profile={profile} />;
}
