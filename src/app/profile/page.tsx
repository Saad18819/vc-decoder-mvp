import type { Metadata } from "next";
import { ProfileClient } from "@/components/profile-client";

export const metadata: Metadata = {
  title: "Profile | Term Sheet Decoder",
  description: "Your Term Sheet Decoder session.",
};

export default function ProfilePage() {
  return (
    <main className="relative min-h-screen bg-[#08080A] px-4 py-10 text-[#f4f4f5] md:px-6 md:py-14">
      <ProfileClient />
    </main>
  );
}
