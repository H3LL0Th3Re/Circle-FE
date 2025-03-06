import {create} from 'zustand'

type User = {
  id: string;
  username: string;
  fullname?: string;
  profile_pic?: string;
  bio?: string;
  isFollowing?: boolean;
  isFollowed?: boolean;
};

type FollowStore = {
  users: User[];
  searchResults: User[];
  setUsers: (users: User[]) => void;
  setSearchResults: (users: User[]) => void;
  toggleUserFollow: (userId: string) => void;
  toggleSearchResultFollow: (userId: string) => void;
};

export const useFollowStore = create<FollowStore>((set) => ({
  users: [],
  searchResults: [],
  setUsers: (users) => set({ users }),
  setSearchResults: (users) => set({ searchResults: users }),
  toggleUserFollow: (userId: string) => 
    set((state) => ({
      users: state.users.map((user: User) =>
        user.id === userId 
          ? { ...user, isFollowing: !user.isFollowing }
          : user
      ),
    })),
  toggleSearchResultFollow: (userId: string) =>
    set((state) => ({
      searchResults: state.searchResults.map((user: User) =>
        user.id === userId
          ? { ...user, isFollowed: !user.isFollowed }
          : user
      ),
    })),
}));