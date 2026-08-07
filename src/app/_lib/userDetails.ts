"use server";

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

import { userDetails } from "@/app/_db/schema";
import { db } from "@/app/_lib/db";

import { supabase } from "./supabase";

const PLACEHOLDER_USER_IMAGE = "/placeholder-user-image.png";

/**
 *
 * @returns user name
 */
export async function getUserName(): Promise<string> {
  const [data] = await db
    .select({
      name: userDetails.name,
    })
    .from(userDetails)
    .where(eq(userDetails.id, 1));

  return data?.name || "";
}

/**
 *
 * @returns user email
 */
export async function getUserEmail(): Promise<string> {
  const [data] = await db
    .select({ email: userDetails.email })
    .from(userDetails)
    .where(eq(userDetails.id, 1));

  return data?.email || "";
}

/**
 *
 * @param userName new name for user
 * updates user name in db
 */
export async function updateUserName(userName: string) {
  await db
    .update(userDetails)
    .set({ name: userName })
    .where(eq(userDetails.id, 1));
}

/**
 *
 * @param email new email for user
 * updates user email in db
 */
export async function updateUserEmail(email: string) {
  await db
    .update(userDetails)
    .set({ email: email })
    .where(eq(userDetails.id, 1));
}

/**
 *
 * @returns path of profile picutre for user
 */
async function getProfilePicturePath(): Promise<string> {
  const [data] = await db
    .select({ profilePicturePath: userDetails.profilePicturePath })
    .from(userDetails)
    .where(eq(userDetails.id, 1));

  return data?.profilePicturePath || PLACEHOLDER_USER_IMAGE;
}

/**
 *
 * @returns a signed url for the path of the profile picture.
 */
export async function getProfilePictureSignedUrl(): Promise<string> {
  const profilePicturePath = await getProfilePicturePath();

  if (profilePicturePath === PLACEHOLDER_USER_IMAGE)
    return PLACEHOLDER_USER_IMAGE;

  const { data: dataFromStorage, error } = await supabase.storage
    .from("books")
    .createSignedUrl(profilePicturePath, 60 * 60);

  return dataFromStorage?.signedUrl || PLACEHOLDER_USER_IMAGE;
}

/**
 *
 * @param file new profile picture
 * @returns a boolean depending on whether the operation of updating profile picture was successfull or not.
 */
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
      console.error("Error while uploading the file", uploadError);
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
