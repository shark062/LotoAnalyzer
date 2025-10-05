
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
}

const mockUser: User = {
  id: "guest-user",
  name: "SHARK User",
  email: "user@sharkloto.com"
};

export function useAuth() {
  // Simplified query without causing React context issues
  const queryResult = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: false, // Disable automatic fetching
  });

  return {
    user: queryResult.data || mockUser,
    isLoading: false,
    isAuthenticated: true,
  };
}
