import { useState, useEffect } from "react";
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Image,
  IconButton,
  Flex
} from "@chakra-ui/react";
import {Divider} from "@chakra-ui/layout"
import { Avatar } from "@/components/ui/avatar"
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  
  DialogContent,
  
  DialogRoot,
  
  DialogTrigger,
} from "@/components/ui/dialog";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { LuImage } from "react-icons/lu";
import { useThreadStore } from "@/useThreadStore";
// import { useUser } from "@/userContext";
// Define types for Post and Reply

interface Author {
    id: number;
    username: string;
    profile_pic: string;
}


interface Reply {
    id: number,
        content: string,
        replyImage: string,
        createdAt: string,
        user: {
            id: number,
            username: string,
            profile_pic: string
        }
}



interface Thread {
    id: number;
    author: Author;
    content: string;
    createdAt: string;
    image?: string;
    isLikedByCurrentUser: boolean;
    likeCount: number;
    replies: Reply[];
}

interface Post {
  id: number;
  thread: Thread;
}

function DetailedImage() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  // const [replyText, setReplyText] = useState("");
  const {
      isLikedByUser,
      fetchThreads,
      content,
      setContent,
      setImageFile,
      handleReply,
      toggleLike,
      getLikeCount,
      fetchThreadbyId,
      imagePreview
    } = useThreadStore();
//   const { user } = useUser();
  // Fetch post details and replies
  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/thread/${postId}`)
      .then((response) => {
        setPost(response.data);
      })
      .catch((error) => console.error("Error fetching post data:", error));
  }, [postId]);

  

  // console.log(post);

  useEffect(() => {
      fetchThreads();
  });

  
  

  const handleReplySubmit = async () => {
    if (!post || !post?.thread.id) {
      console.error("No thread ID available");
      return;
    }

    try {
      await handleReply(post.thread.id.toString());
      // console.log(replies)
      
      // Refresh the post data after successful reply
      const response = await axios.get(`http://localhost:3000/api/thread/${postId}`);
      setPost(response.data);
    } catch (error) {
      console.error("Failed to submit reply:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleLikeToggle = async () => {
    if (!post?.thread.id) return;
    
    await toggleLike(post.thread.id.toString());
    // Refresh the post data to get updated like status
    if (!postId) {
        console.error("Invalid postId: postId is null or undefined.");
        return;
      }
    try{
        const updatedPost = await fetchThreadbyId(postId);
        if(updatedPost){
            setPost(updatedPost);
        }else{
            console.error("updated post is null or undefined");
        }
    }catch (error){
        console.log("Failed to fetch updated post: ", error)
    }
    
  };
  console.log("post: ", post);
  
  // console.log(setImageFile);
  if (!post) return <Text>Loading...</Text>;
  
  return (
    <Box maxW="600px" mx="auto" p="4">
      {/* Post Header */}
      <HStack gap="4" alignItems="flex-start">
        <Avatar src={post.thread.author.profile_pic} name={post?.thread.author.username} />
        <Box>
          <Text fontWeight="bold">{post?.thread.author.username}</Text>
          <Text fontSize="sm" color="gray.500">
            {new Date(post?.thread.createdAt).toLocaleString()}
          </Text>
          <Text mt="2">{post?.thread.content}</Text>
          
          {post.thread.image && (
            <DialogRoot>
              <DialogTrigger asChild>
                <Box mt="4" rounded="lg" overflow="hidden">
                  <Image
                    src={post.thread.image ?? ""}
                    alt="Post"
                    width= "100%"
                    objectFit= "cover"
                    borderRadius= "8px"
                  />
                </Box>
              </DialogTrigger>
              <DialogContent style={{
                  width: '80%', 
                  maxWidth: '1200px', 
                  height: 'auto', 
                  padding: '16px', 
                  borderRadius: '16px', 
                }}>
                <Box mt="4" rounded="lg" overflow="hidden">
                  <Image
                    src={post?.thread.image}
                    alt="Post"
                    width= "100%"
                    objectFit= "cover"
                    borderRadius= "8px"
                  />
                </Box>
              </DialogContent>
            </DialogRoot>
          )}
          
        </Box>
        
      </HStack>
      <Flex justify="space-between" align="center" mt="4">
          <Flex gap="2" align="center">
            <IconButton
              aria-label="Like"
              onClick={handleLikeToggle}
              variant="ghost"
            >
              {isLikedByUser(post?.thread.id.toString()) ? (
                <IoHeart color="red" />
              ) : (
                <IoHeartOutline />
              )}
            </IconButton>
            <Text as="span" fontWeight="bold">
              {getLikeCount(post?.thread.id.toString())} Likes
            </Text>
          </Flex>
          <Button
            size="sm"
            colorScheme="blue"
            variant="ghost"
          >
            {post.thread.replies.length || 0} 💬 Reply
          </Button>
        </Flex>

      <Divider my="4" />

      {/* Reply Section */}
      <Text fontWeight="bold" mb="2">
        Replies
      </Text>
      <VStack align="stretch" gap="4">
        {post?.thread.replies.map((reply) => (
          <HStack key={reply.id} alignItems="flex-start" gap="4">
            <Avatar src={reply.user?.profile_pic} name={reply?.user?.username} />
            <Box>
              <Text fontWeight="bold">
                {reply?.user?.username}
                
              </Text>
              <Text fontSize="sm" color="gray.500">
                {new Date(reply.createdAt).toLocaleString()}
              </Text>
              <Text mt="1">{reply.content}</Text>
              {reply.replyImage &&  (
                <DialogRoot>
                  <DialogTrigger asChild>
                    <Box mt="4" rounded="lg" overflow="hidden">
                      <Image
                        src={reply.replyImage}
                        alt="Post"
                        width= "100%"
                        objectFit= "cover"
                        borderRadius= "8px"
                      />
                    </Box>
                  </DialogTrigger>
                  <DialogContent style={{
                      width: '80%', // Set dialog width (adjust as needed)
                      maxWidth: '1200px', // Set a maximum width for responsiveness
                      height: 'auto', // Allow dynamic height based on content
                      padding: '16px', // Add padding for inner spacing
                      borderRadius: '16px', // Round the corners
                    }}>
                    <Box mt="4" rounded="lg" overflow="hidden">
                      <Image
                        src={reply.replyImage}
                        alt="Post"
                        width= "100%"
                        objectFit= "cover"
                        borderRadius= "8px"
                      />
                    </Box>
                  </DialogContent>
              </DialogRoot>
            )}
            </Box>
          </HStack>
          
        ))}
        
      </VStack>

      {/* Add Reply Input */}
      <Box mt="4">
              `<VStack align="stretch" gap="4">
              {/* Input and Attach Image Button */}
              <HStack gap="4" align="center">
                  <Input
                  placeholder="Type your reply..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  flex="1"
                  />
                  <IconButton
                  aria-label="Add Image"
                  size="sm"
                  bg="gray.500"
                  _hover={{ bg: "gray.200" }}
                  as="label"
                  >
                  <LuImage />
                  <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      name="image"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                        } else {
                          console.error("No file selected");
                        }
                      }}
                  />
                  </IconButton>
              </HStack>
              {/* Preview Image */}
              {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '200px', borderRadius: '8px' }} />}
              {/* Submit Button */}
              <Button colorScheme="green" onClick={handleReplySubmit}>
                  Reply
              </Button>
              </VStack>
          </Box>`
    </Box>
  );
};

export default DetailedImage;
