/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { useState } from 'react';
import { GridItem, IconButton, Input } from "@chakra-ui/react"
import {
    Box,
    Button,
    Flex,
    Text,
    VStack,
    Heading,
    HStack,
    Image,
  } from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar"
import {
    DialogActionTrigger,
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
// import { useUser } from '@/userContext';

import { ThreadsType } from '@/types/threads.types';
import { Grid } from '@chakra-ui/layout';
import { useNavigate } from 'react-router-dom';
import { IoHeart, IoHeartOutline } from 'react-icons/io5';
import { useStore } from "@/useStore";
import axios from 'axios';
import * as Tabs from "@radix-ui/react-tabs";
import { useThreadStore } from '@/useThreadStore';
import { jwtDecode } from 'jwt-decode';

import Swal from 'sweetalert2';
import { formatDistanceToNow } from 'date-fns';





interface JwtPayload {
  id: string;
  [key: string]: any;
}
const ProfileDetail = () => {
  const { user, updateUser, fetchUser } = useStore();
  
  const navigate = useNavigate();
  const {
      isLikedByUser,
      threads,
      
      fetchThreadUser,
      
      toggleLike,
      
    } = useThreadStore();
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
 const [editedData, setEditedData] = useState({
     fullname: '',
     username: '',
     bio: '',
     profile_pic: null as File | null,
     banner_pic: null as File | null,
   });
 
  const [previewUrls, setPreviewUrls] = useState({
    profile_pic: '',
    banner_pic: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const defaultProfilePic = "https://tse1.mm.bing.net/th?id=OIP.Br5ihkw7BCVc-bdbrr-PxgHaHa&pid=Api&P=0&h=180";
  const defaultBannerPic = "https://tse1.mm.bing.net/th?id=OIP.Kg6YNNbgzoyNhJ_oTdr54gHaCT&pid=Api&P=0&h=180";
  
  const handleLikeToggle = async (postId: string) => {
    await toggleLike(postId);
  };

  useEffect(() => {
      if (user) {
        setEditedData({
          fullname: user.fullname || '',
          username: user.username || '',
          bio: user.bio || '',
          profile_pic: null,
          banner_pic: null,
        });
        setPreviewUrls({
          profile_pic: user.profile_pic || '',
          banner_pic: user.banner_pic || '',
        })
      }
    }, [user]);


  
  

  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchUser();
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch user data');
        setLoading(false);
        console.log(error);
      }
    };

    initializeData();
  }, [fetchUser]);
  
  const getFollowCounts = async (userId: string) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`http://localhost:3000/api/users/${userId}/follow-counts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);
    return response.data; // { followersCount, followingCount }
  };

  useEffect(() => {
      const fetchFollowCounts = async () => {
        try {
          // console.log("the user: ", current_user);
          const token = localStorage.getItem("token");
          if(!token){
            return;
          }
          const current_user = (jwtDecode(token) as JwtPayload).id;
          const counts = await getFollowCounts(current_user.toString());
          setFollowCounts({
            followers: counts.followersCount,
            following: counts.followingCount,
          });
        } catch (error) {
          console.error("Failed to fetch follow counts:", error);
          setError("Failed to fetch follow counts");
        }
      };
    
      fetchFollowCounts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setEditedData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
  
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile_pic' | 'banner_pic') => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      try {
        // Create a new FileReader
        const reader = new FileReader();
  
        // Set up the FileReader onload event
        reader.onload = () => {
          // The result is a base64 string
          const base64String = reader.result as string;
          
          setPreviewUrls(prev => ({
            ...prev,
            [type]: base64String
          }));
        };
  
        // Read the file as a data URL (base64)
        reader.readAsDataURL(file);
  
        // Update edited data with the actual file
        setEditedData(prev => ({
          ...prev,
          [type]: file
        }));
      } catch (error) {
        console.error('Error reading file:', error);
        Swal.fire({
          title: "oops!",
          text: 'Error reading file. Please try again.',
          icon: "error"
        });
        // alert('Error reading file. Please try again.');
      }
    };
  
    const handleSave = async () => {
      try {
          const formData = new FormData();
          formData.append('fullname', editedData.fullname);
          formData.append('username', editedData.username);
          formData.append('bio', editedData.bio);
          
          if (editedData.profile_pic) {
              formData.append('profile_pic', editedData.profile_pic);
          }
          
          if (editedData.banner_pic) {
              formData.append('banner_pic', editedData.banner_pic);
          }
  
          await updateUser(formData);
          await fetchUser();
          
          // Clean up preview URLs
          URL.revokeObjectURL(previewUrls.profile_pic);
          URL.revokeObjectURL(previewUrls.banner_pic);
          Swal.fire({
            title: "Good job!",
            text: 'Profile updated successfully',
            icon: "success"
          });
          // alert('Profile updated successfully');
      } catch (error) {
          console.error('Error updating profile:', error);
          Swal.fire({
            title: "oops!",
            text: 'Failed to update profile',
            icon: "error"
          });
          // alert('Failed to update profile');
      }
  };
  
  
    const handleCancel = () => {
      // Clean up preview URLs
      URL.revokeObjectURL(previewUrls.profile_pic);
      URL.revokeObjectURL(previewUrls.banner_pic);
      
      if (user) {
        setPreviewUrls({
          profile_pic: user.profile_pic || '',
          banner_pic: user.banner_pic || '',
        });
        setEditedData({
          fullname: user.fullname || '',
          username: user.username || '',
          bio: user.bio || '',
          profile_pic: null,
          banner_pic: null,
        });
      }
    };

  
  
  const getLikes = (post: ThreadsType): number => {
    if (!post || !Array.isArray(post.likes)) return 0;
    return post.likes.length;
  };

  

  // useEffect(() => {
  //   if (user?.id) {  // Only fetch if we have a user ID
  //     fetchThreads();
  //   }
  // }, [user?.id]); // Add user?.id as a dependency

  useEffect(() => {
    fetchThreadUser();
  });

  const [tabValue, setTabValue] = useState('recent_post');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  // console.log(threads);


  return (
    <div className="posts">
      <Box bg="gray.800" color="white" p={5}>
        {/* Profile Info */}
        <Box bg="gray.800" borderRadius="lg" p={5} mb={6}>
          <Flex justify="space-between" align="center" position="relative" paddingBottom={2}>
            <Image rounded="md" src={user?.banner_pic || defaultBannerPic} alt="User image" height={150} width="100%" style={{ objectFit: "cover" }}/>
            <Avatar size="xl" name={user?.fullname} src={user?.profile_pic || defaultProfilePic} position="absolute" bottom={-7} left={5} width="80px" height="80px" />
          </Flex>
  
          {/* Edit Profile Button */}
          <DialogRoot key="md" size="md">
            <DialogTrigger asChild>
              <Button variant="outline" borderColor="whiteAlpha.400" height={8} left={630} borderRadius={30}>
                Edit Profile
              </Button>
            </DialogTrigger>
  
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User Profile</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <Flex justify="space-between" align="center" position="relative" paddingBottom={2}>
                  <Box position="relative" width="100%" height="85px">
                    <Image
                      rounded="md"
                      src={previewUrls.banner_pic || defaultBannerPic}
                      alt="Banner preview"
                      height={85}
                      width={400}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'banner_pic')}
                      position="absolute"
                      top={0}
                      left={0}
                      opacity={0}
                      width="100%"
                      height="100%"
                      cursor="pointer"
                    />
                  </Box>
  
                  {/* Profile Picture Upload */}
                  <Box position="relative">
                    <Avatar
                      size="xl"
                      name={editedData.fullname}
                      src={previewUrls.profile_pic || defaultProfilePic}
                      position="absolute"
                      bottom={-3}
                      left={3}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'profile_pic')}
                      position="relative"
                      bottom={-3}
                      left={3}
                      opacity={0}
                      width="60px"
                      height="88px"
                      cursor="pointer"
                      borderRadius="full"
                    />
                  </Box>
                </Flex>
  
                {/* Editable Fields */}
                <div style={{ marginTop: '2rem' }}>
                  <label>Name</label>
                  <Input
                    type="text"
                    name="fullname"
                    value={editedData.fullname}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '1rem',
                      borderRadius: '0.5rem',
                    }}
                  />
  
                  <label>Username</label>
                  <Input
                    type="text"
                    name="username"
                    value={editedData.username}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '1rem',
                      borderRadius: '0.5rem',
                    }}
                  />
  
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={editedData.bio}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      height: '5rem',
                      borderRadius: '0.5rem',
                    }}
                  />
                </div>
              </DialogBody>
  
              {/* Dialog Footer with Save and Cancel */}
              <DialogFooter>
                <DialogActionTrigger asChild>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </DialogActionTrigger>
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
  
              <DialogCloseTrigger />
            </DialogContent>
          </DialogRoot>
  
          <VStack align="start" mt={4}>
            <Heading size="md">{editedData.fullname}</Heading>
            <Text fontSize="sm" color="gray.400">@{editedData.username}</Text>
            <Text fontSize="sm">{editedData.bio}</Text>
            <HStack>
              <Text fontWeight="bold">{followCounts.following}</Text>
              <Text color="gray.400">Following</Text>
              <Text fontWeight="bold">{followCounts.followers}</Text>
              <Text color="gray.400">Followers</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Recent Threads */}

        <Tabs.Root value={tabValue} onValueChange={setTabValue}>
          <Box position="relative">
            <Tabs.List style={{
              margin: '30px',
              display: 'flex',
              justifyContent: 'space-around',
              position: 'relative',
            }}>
              <Tabs.Trigger value='recent_post' style={{
                padding: '8px 16px',
                cursor: 'pointer',
                color: tabValue === 'All Post' ? 'white' : 'gray',
                fontWeight: tabValue === 'All Post' ? 'bold' : 'normal',
              }}>
                Recent Post
              </Tabs.Trigger>
              <Tabs.Trigger value="media_post" style={{
                padding: '8px 16px',
                cursor: 'pointer',
                color: tabValue === 'Media' ? 'white' : 'gray',
                fontWeight: tabValue === 'Media' ? 'bold' : 'normal',
              }}>
                Media
              </Tabs.Trigger>
            </Tabs.List>
          </Box>
          
            <Tabs.Content value="recent_post">
              <Box bg="gray.800" p={4} borderRadius="md" mb={5}>
                <Text fontSize="xl" fontWeight="bold" mb={3}>
                  Recent Threads
                </Text>
                <Grid gap="6" templateColumns={{ base: "1fr", md: "1fr" }} mt="6">
                  {threads.length > 0 && threads.map((post) => (
                    <Box key={post.id} p="4" borderBottom="1px solid" borderColor="gray.200">
                      <Flex direction="column" gap="4">
                        {/* Post Header */}
                        <Flex align="start" gap="4">
                          {/* <Avatar size="lg" name={post.username} src={post.avatar} /> */}
                          <Avatar size="lg" name={post.author?.username} src={post.author?.profile_pic} />
                          <Box>
                            <Text fontWeight="bold">
                              {post.author?.username}{" "}
                              
                              <Text as="span" fontWeight="normal" color="gray.500">
                                @{post.author?.fullname}
                              </Text>{" "}
                              • {formatDistanceToNow(new Date(post.createdAt), {
                                addSuffix: true,
                              })}{" "}
                            </Text>
                            <Text fontSize="md" mt="2" color="gray.100">
                              {post.content}
                            </Text>
                            {/* Post Image */}
                            {post.image && (
                              <Box mt="4" rounded="lg" overflow="hidden">
                                <Image
                                  src={post.image}
                                  alt="Post"
                                  width= "100%"
                                  objectFit= "cover"
                                  borderRadius= "8px"
                                />
                              </Box>
                            )}
                          </Box>
                        </Flex>
          
                        {/* Post Actions */}
                        <Flex justify="space-between" align="center" mt="4">
                          <Flex gap="2" align="center">
                            <IconButton
                              aria-label="Like"
                              onClick={() => handleLikeToggle(post.id.toString())}
                              variant="ghost"
                            >
                              {isLikedByUser(post.id.toString()) ? (
                                <IoHeart color="red" />
                              ) : (
                                <IoHeartOutline />
                              )}
                            </IconButton>
                            <Text as="span" fontWeight="bold">
                              {getLikes(post)} Likes
                            </Text>
                          </Flex>
                          <Button
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => navigate(`post-detail/${post.id}`)} // Redirect to post detail page
                            >
                              {Array.isArray(post.replies) ? post.replies.length : 0} 💬 Reply
                            </Button>
                        </Flex>
                      </Flex>
                    </Box>
                  ))}
                </Grid>
              </Box>
            </Tabs.Content>

            <Tabs.Content value="media_post">
              {threads.some((thread) => thread.image) ? (
                <Grid templateColumns="repeat(3, 1fr)" gap={4} mt={4}>
                  {threads
                    .filter((thread) => thread.image)
                    .map((thread) => (
                      <GridItem key={thread.id}>
                        <Image
                          src={thread.image}
                          width="244px"
                          height="244px"
                          objectFit="cover"
                          borderRadius="md"
                          cursor="pointer"
                          onClick={() => navigate(`image-detail/${thread.id}`)}
                        />
                      </GridItem>
                    ))}
                </Grid>
              ) : (
                <Text color="gray.500" textAlign="center" mt={4}>
                  No media uploaded yet.
                </Text>
              )}
            </Tabs.Content>
        </Tabs.Root>        
      </Box>
    </div>
  );
};

export default ProfileDetail;
