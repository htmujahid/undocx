import { redirect } from "next/navigation";
import { connection } from "next/server";
import { newId } from "~@/lib/id";

export async function GET() {
  await connection();
  redirect(`/chat/${newId()}`);
}
