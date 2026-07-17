"use server";

import { db } from "@/app/_lib/db";

import { userDetails } from "@/app/_db/schema";

import { eq } from "drizzle-orm";

export async function getUserName(): Promise<string> {
  const [data] = await db
    .select({
      name: userDetails.name,
    })
    .from(userDetails)
    .where(eq(userDetails.id, 1));

  return data?.name || "";
}

export async function getUserEmail(): Promise<string> {
  const [data] = await db
    .select({ email: userDetails.email })
    .from(userDetails)
    .where(eq(userDetails.id, 1));

  return data?.email || "";
}

export async function getProfilePicturePath(): Promise<string> {
  const [data] = await db
    .select({ profilePicturePath: userDetails.profilePicturePath })
    .from(userDetails)
    .where(eq(userDetails.id, 1));

  return data?.profilePicturePath || "/placeholder-user-image.png";
}
