export type ThreadsType = {
    authorId: number;
    content: string;
    createdAt: Date;
    id: number;
    image: string;
    updatedAt: Date;
    author: {
        id: number;
        username: string;
        profile_pic?: string;
        banner_pic?: string;
        fullname?: string | "";
    } | null;
    likes: number;
    replies: number
    isLiked: boolean;
}
