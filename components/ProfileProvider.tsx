"use client";

import { createContext, useContext } from "react";

type Profile = {
  display_name: string;
  role: "teacher" | "student";
};

type ProfileContextValue = {
  profile: Profile | null;
};

const ProfileContext = createContext<ProfileContextValue>({ profile: null });

/** Nhận profile từ server layout truyền xuống, không fetch lại từ client. */
export function ProfileProvider({
  userId,
  initialProfile,
  children,
}: {
  userId?: string;
  initialProfile?: Profile | null;
  children: React.ReactNode;
}) {
  const profile = userId ? (initialProfile ?? null) : null;

  return (
    <ProfileContext.Provider value={{ profile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
