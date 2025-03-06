import { create } from "zustand";
import axios from "axios";
import {persist} from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { UsersType } from '@/types/users.types';

interface User {
  id: string;
  fullname: string;
  email: string;
  username: string;
  bio: string;
  profile_pic: string;
  banner_pic: string;
}

interface UserState {
  user: User | null;
  suggestedUsers: UsersType[];
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  fetchUser: () => Promise<void>;
  updateUser: (userData: FormData) => Promise<void>;
  fetchSuggestedUsers: () => Promise<void>;
  // toggleFollowUser: (userId: string) => Promise<void>;
  toggleFollowUser: (userId: string) => Promise<Response | undefined>;
  login: (token: string) => void;
  logout: () => void;
}

interface JwtPayload {
  id: string;
  [key: string]: any;
}

export const useStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      suggestedUsers: [],
      isAuthenticated: !!localStorage.getItem("token"),

      setUser: (user) => set({ user }),

      fetchSuggestedUsers: async () => {
        console.log("Starting fetchSuggestedUsers");
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found for fetching suggested users");
          return;
        }
        
        try {
          const decoded = jwtDecode(token) as { id: string };
          const userId = decoded.id;
          console.log("Current userId:", userId);
          
          const response = await axios.get(
            `http://localhost:3000/api/users/${userId}/suggest-users`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.data) {
            console.error("API returned no data");
            return;
          }

          // Filter out any users that are already followed
          const filteredUsers = response.data.filter(
            (user: UsersType) => !user.isFollowed
          );

          set({ suggestedUsers: filteredUsers });
          console.log("Store updated with suggested users:", get().suggestedUsers);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("API Error:", {
              status: error.response?.status,
              data: error.response?.data,
              config: error.config
            });
          } else {
            console.error("Non-Axios error:", error);
          }
          throw error;
        }
      },

      toggleFollowUser: async (userId: string) => {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found. Please log in again.");

          const decodedToken: { userId: string } = jwtDecode(token);
          const currentUserId = decodedToken.userId;

          const response = await fetch("http://localhost:3000/api/users/toggle-follow", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              followerId: currentUserId,
              followingId: userId,
            }),
          });
          console.log(response)

          if (response.status === 200) {
            // Remove the followed user from suggestedUsers
            set((state) => ({
              suggestedUsers: state.suggestedUsers.filter(
                (user) => user.id !== userId
              ),
            }));
            return response;
          }
        } catch (error) {
          console.error("Error toggling follow:", error);
          throw error;
        }
      },

      updateUser: async (formData: FormData) => {
        const token = localStorage.getItem("token");
        if(!token){
          return;
        }
        const userId = (jwtDecode(token) as JwtPayload).id;
        if (!token) throw new Error("No authentication token");
    
        try {
            const response = await axios.put(
                `http://localhost:3000/api/users/${userId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
    
            set({ user: response.data.user });
            return response.data;
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    },

      fetchUser: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found during fetch");
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          const response = await axios.get("http://localhost:3000/api/users", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Fetched user data:", response.data);
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          console.error("Detailed fetch error:", error);
          set({ user: null, isAuthenticated: false });
          localStorage.removeItem("token");
        }
      },

      login: (token: string) => {
        localStorage.setItem("token", token);
        set({ isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "user-storage",
    }
  )
);


// export const useUserStore = create<UserState>((set) => ({
//   user: null,
//   isAuthenticated: !!localStorage.getItem("token"),

//   fetchUser: async (token: string) => {
//     try {
//       const response = await axios.get("http://localhost:3000/api/users", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       set({
//         user: response.data,
//         isAuthenticated: true,
//       });
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//       set({
//         user: null,
//         isAuthenticated: false,
//       });
//       localStorage.removeItem("token");
//     }
//   },

//   updateUser: async (userData: Partial<User>) => {
//     const token = localStorage.getItem("token");
//     if (!token) throw new Error("No token found");

//     try {
//       const response = await axios.put(
//         "http://localhost:3000/api/users",
//         userData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       set((state) => ({
//         user: { ...state.user, ...response.data } as User,
//       }));

//       return response.data;
//     } catch (error) {
//       console.error("Error updating user data:", error);
//       throw error;
//     }
//   },

//   login: (token: string) => {
//     localStorage.setItem("token", token);
//     set({ isAuthenticated: true });
//   },

//   logout: () => {
//     localStorage.removeItem("token");
//     set({
//       user: null,
//       isAuthenticated: false,
//     });
//   },
// }));
