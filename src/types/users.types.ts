export interface UsersType {
    id: string;
    fullname: string;
    username: string;
    email: string;
    bio: string | null;
    profile_pic: string | null;
    banner_pic: string | null;
    isFollowed: boolean; 
    createdAt?: string;
    updatedAt?: string;
  }
  
  
  export interface FollowCounts {
    followers: number;
    following: number;
  }
  
  export interface FollowToggleResponse {
    message: string;
    isFollowed: boolean;
  }