import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Always return authenticated for direct dashboard access
  const mockUser: User = {
    id: "guest-user",
    name: "SHARK User",
    email: "user@sharkloto.com"
  };

  return {
    user: user || mockUser,
    isLoading: false,
    isAuthenticated: true,
  };
}
