import { useGetMyProfile } from "@workspace/api-client-react";

export function useCurrentUser() {
  const { data: profile, isLoading } = useGetMyProfile();
  return { user: profile ?? null, isLoading, userId: profile?.id ?? null };
}
