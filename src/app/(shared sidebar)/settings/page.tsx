import { Metadata } from "next";

import SettingsPageView from "@/app/_components/settings/SettingPageView";
import {
  getProfilePictureSignedUrl,
  getUserEmail,
  getUserName,
} from "@/app/_lib/userDetails";

export const metadata: Metadata = {
  title: "Lumina - Settings",
};

export default async function SettingsPage() {
  const [userName, email, profilePicturePath] = await Promise.all([
    getUserName(),
    getUserEmail(),
    getProfilePictureSignedUrl(),
  ]);

  return (
    <>
      <SettingsPageView
        userName={userName}
        email={email}
        profilePicturePath={profilePicturePath}
      />
    </>
  );
}
