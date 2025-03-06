import { create } from 'zustand';
import { ThreadsType } from '@/types/threads.types';
import { getAllThreads } from '@/services/thread.services';
import { jwtDecode, JwtPayload} from 'jwt-decode';
import axios from 'axios';
import Swal from 'sweetalert2'

interface ThreadState {
  threads: ThreadsType[];
  likeCounts: Record<string, number>;
  content: string;
  imageFile: File | null;
  currentThread: any;
  imagePreview: string | null;
  
  setThreads: (threads: ThreadsType[]) => void;
  setContent: (content: string) => void;
  setReply: (content: string) => void;
  setImageFile: (file: File | null) => void;
  fetchThreads: () => Promise<void>;
  fetchThreadUser: () => Promise<void>;
  handlePost: () => Promise<void>;
  handleReply: (threadId: string) => Promise<void>;
  handleEdit: (threadId: string) => Promise<void>;
  handleDelete: (threadId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  loadLikeCounts: () => void;
  getLikeCount: (threadId: string) => number;
  isLikedByUser: (threadId: string) => boolean;
  fetchThreadbyId: (threadId: string) => Promise<any | null>;
}

interface CustomJwtPayload extends JwtPayload {
    id: number;
}

interface Like {
    userId: number;
}

export const useThreadStore = create<ThreadState>((set, get) => {
  const savedLikeCounts = JSON.parse(localStorage.getItem('likeCounts') || '{}');

  return {
    threads: [],
    likeCounts: savedLikeCounts,
    content: "",
    imageFile: null,
    currentThread: null,
    imagePreview: null,

    setThreads: (threads) => set({ threads }),
    setContent: (content) => set({ content }),
    setImageFile: (file) => {
        let preview: string | null = null;
        if (file) {
          preview = URL.createObjectURL(file);
        }
        set({ imageFile: file, imagePreview: preview });
    },

    setReply: (content) => set({ content }),

    loadLikeCounts: () => {
      const savedCounts = JSON.parse(localStorage.getItem('likeCounts') || '{}');
      set({ likeCounts: savedCounts });
    },

    getLikeCount: (threadId: string) => {
      return get().likeCounts[threadId] || 0;
    },

    fetchThreadUser: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
        console.error("No token found! User is not authenticated.");
        return;
        }
    
        try {
        const response = await fetch("http://localhost:3000/api/thread/thread-user", {
            method: "GET",
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", 
            },
        });
    
        if (response.ok) {
            const data = await response.json();
            if (data.threads && Array.isArray(data.threads)) {
                set({threads: data.threads});
                const newLikeCounts: Record<string, number> = {};
                data.threads.forEach((thread: ThreadsType) => {
                    newLikeCounts[thread.id] = Array.isArray(thread.likes) ? thread.likes.length : 0;
                });
                
                localStorage.setItem('likeCounts', JSON.stringify(newLikeCounts));
                set({ likeCounts: newLikeCounts });
            // setPosts(data.threads); // Update the store if needed
            } else {
            console.error("Received invalid data format:", data);
            }
        } else {
            const error = await response.json();
            console.error("Failed to fetch threads:", error.message);
        }
        } catch (error) {
        console.error("Error fetching threads:", error);
        }
    },

    isLikedByUser: (threadId: string) => {
      const token = localStorage.getItem('token');
      
      if (!token) return false;
      const decoded = jwtDecode<CustomJwtPayload>(token);
      const userId = decoded.id;
      // Try to find thread in both threads array and currentThread
      const threadFromList = get().threads.find(t=> t.id.toString() == threadId);
      const currentThread = get().currentThread?.thread;
      const thread = threadFromList || currentThread;
                    
    //   console.log("Thread found:", thread);
    //   console.log("Current user ID:", userId);
    //   console.log("Thread likes:", thread?.likes);
      if(!thread || !thread.likes) return false;
      const isLiked = thread?.likes?.some((like: Like) => like.userId === userId);
      console.log("Is liked:", isLiked);
      if (!thread || !thread.likes) return false;
      
      return thread.likes.some((like: Like) => like.userId === userId);
    },

    fetchThreads: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found! User is not authenticated.");
        return;
      }
      try {
        const threads_list = await getAllThreads(token);
        set({ threads: threads_list });
        
        const newLikeCounts: Record<string, number> = {};
        threads_list.forEach((thread: ThreadsType) => {
            newLikeCounts[thread.id] = Array.isArray(thread.likes) ? thread.likes.length : 0;
        });
        
        localStorage.setItem('likeCounts', JSON.stringify(newLikeCounts));
        set({ likeCounts: newLikeCounts });
      } catch (error) {
        console.error(error);
      }
    },

    fetchThreadbyId: async (threadId) => {
      const token = localStorage.getItem('token');
      if(!token){
        console.error("log in first");
        return null;
      }
      try {
        const response = await axios.get(`http://localhost:3000/api/thread/${threadId}`);
        // const thread = response.data.thread;
        set({currentThread: response.data});
        // Update both threads array and currentThread
        set((state) => ({
          threads: state.threads.map((thread: ThreadsType) => 
            (thread.id).toString() === threadId ? response.data.thread : thread
        ),
        }));

        // Update like count
        const newLikeCount = response.data.thread.likes?.length || 0;
        set((state) => ({
          likeCounts: {
            ...state.likeCounts,
            [threadId]: newLikeCount
          }
        }));
        localStorage.setItem('likeCounts', JSON.stringify(get().likeCounts));
        
        return response.data;
      } catch(error) {
        console.error("Error fetching thread:", error);
        return null;
      }
    },

    handlePost: async () => {
      const { content, imageFile} = get();
      if (!content) {
        Swal.fire({
            title: "oops!",
            text: "Content cannot be empty.",
            icon: "warning",
        })
        
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) return;
      
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      const currentUserId = decodedToken.id;

      const formData = new FormData();
      formData.append("content", content);
      formData.append("authorId", currentUserId.toString());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      try {
        const response = await fetch("http://localhost:3000/api/thread", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
            Swal.fire({
                title: "Good job!",
                text: "Post created successfully!",
                icon: "success"
            });
          set({ content: "", imageFile: null , imagePreview: ""});
          
          get().fetchThreads();
        } else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Failed to create the post.",
              });
          
        }
      } catch (error) {
        console.error("Error posting thread:", error);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "An error occurred while creating the post.",
          });
      }
    },

    handleReply: async (threadId: string) => {
      const token = localStorage.getItem("token");
      const { content, imageFile } = get();
      
      if (!token) {
        console.error("Token is missing or invalid.");
        return;
      }

      if (!content.trim()) {
        console.error("Reply text cannot be empty.");
        return;
      }

      if (!threadId) {
        throw new Error("Thread ID is required.");
      }

      const formData = new FormData();
      formData.append("content", content);
      formData.append("threadId", threadId);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      try {
        const response = await fetch("http://localhost:3000/api/thread/reply", {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.log('Error response:', errorData);
          throw new Error("Failed to create the reply.");
        }

        set({ content: "", imageFile: null , imagePreview: ""});
        return await response.json();
      } catch (error) {
        console.error("Error posting reply:", error);
        throw error;
      }
    },

    handleEdit: async (threadId) => {
      const { content, imageFile } = get();
      const token = localStorage.getItem("token");
      if (!token) {
        alert("login to edit post");
        return;
      }

      const formData = new FormData();
      formData.append("content", content);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      try {
        const response = await fetch(`http://localhost:3000/api/thread/${threadId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData
        });

        if (response.ok) {
            Swal.fire({
                title: "Good job!",
                text: "Post update successfully",
                icon: "success"
              });
          set({ content: "", imageFile: null });
          get().fetchThreads();
        } else {
            Swal.fire({
                title: "Oops!",
                text: "failed to update post",
                icon: "error"
              });
        }
      } catch (error) {
        console.error("Error updating thread:", error);
        Swal.fire({
            title: "Oops!",
            text: "An error occurred while updating the post.",
            icon: "error"
          });
        
      }
    },

    handleDelete: async (threadId) => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to delete posts");
        return;
      }
      try {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "You can't recover your post!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!"
        });
      
        // Only proceed with deletion if user confirmed
        if (result.isConfirmed) {
          const response = await fetch(`http://localhost:3000/api/thread/${threadId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
      
          if (response.ok) {
            set((state) => ({
              threads: state.threads.filter((thread:ThreadsType) => (thread.id).toString() !== threadId)
            }));
            
            // Show success message
            await Swal.fire({
              title: "Deleted!",
              text: "Your post has been deleted.",
              icon: "success"
            });
          } else {
            // Show error message
            await Swal.fire({
              title: "Error!",
              text: "Failed to delete the post.",
              icon: "error"
            });
          }
        }
      } catch (error) {
        console.error("Error deleting thread:", error);
        
        // Show error message
        await Swal.fire({
          title: "Error!",
          text: "An error occurred while deleting the post.",
          icon: "error"
        });
      }
    },

    toggleLike: async (postId: string) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Make API call first
        const response = await fetch('http://localhost:3000/api/thread/like', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ threadId: parseInt(postId) }),
        });

        if (!response.ok) {
          throw new Error('Failed to toggle like');
        }

        // Update the thread data

        const updatedThreadResponse = await axios.get(`http://localhost:3000/api/thread/${postId}`);
        const updatedThread = updatedThreadResponse.data.thread;


        set((state) => ({
            threads: state.threads.map(thread => 
              thread.id.toString() === postId ? updatedThread : thread
            ),
            currentThread: updatedThreadResponse.data,
            likeCounts: {
              ...state.likeCounts,
              [postId]: updatedThread.likes?.length || 0
            }
          }));
  
          localStorage.setItem('likeCounts', JSON.stringify(get().likeCounts));

      } catch (error) {
        console.error('Error toggling like:', error);
      }
    }
  };
});