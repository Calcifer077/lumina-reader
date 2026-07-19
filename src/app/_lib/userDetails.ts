"use server";

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

import { userDetails } from "@/app/_db/schema";
import { db } from "@/app/_lib/db";

import { supabase } from "./supabase";

const PLACEHOLDER_USER_IMAGE = "/placeholder-user-image.png";

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

async function getProfilePicturePath(): Promise<string> {
  const [data] = await db
    .select({ profilePicturePath: userDetails.profilePicturePath })
    .from(userDetails)
    .where(eq(userDetails.id, 1));

  return data?.profilePicturePath || PLACEHOLDER_USER_IMAGE;
}

export async function getProfilePictureSignedUrl(): Promise<string> {
  const profilePicturePath = await getProfilePicturePath();

  if (profilePicturePath === PLACEHOLDER_USER_IMAGE)
    return PLACEHOLDER_USER_IMAGE;

  const { data: dataFromStorage, error } = await supabase.storage
    .from("books")
    .createSignedUrl(profilePicturePath, 60 * 60);

  return dataFromStorage?.signedUrl || PLACEHOLDER_USER_IMAGE;
}

export async function updateProfilePicture(file: File): Promise<boolean> {
  try {
    const pathFromStorage = await getProfilePicturePath();

    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let filePath = "";

    if (pathFromStorage === PLACEHOLDER_USER_IMAGE) {
      const idForStorage = randomUUID();
      filePath = `${idForStorage}/${safeFilename}`;
    } else {
      const idFromStorage = pathFromStorage.split("/").at(-1);
      filePath = `${idFromStorage}/${safeFilename}`;
    }

    const { error: uploadError } = await supabase.storage
      .from("books")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.log("Error while uploading the file", uploadError);
      return false;
    }

    await db
      .update(userDetails)
      .set({ profilePicturePath: filePath })
      .where(eq(userDetails.id, 1));

    return true;
  } catch (err) {
    console.error("Error occured while updating profile picture", err);

    return false;
  }
}
