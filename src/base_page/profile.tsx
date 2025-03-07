/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Input } from "@chakra-ui/react"
import {
    Box,
    Button,
    Flex,
    Text,
    VStack,
    Heading,
    HStack,
    Link,
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


import { UsersType } from '@/types/users.types';
import { useStore } from '@/useStore';
import axios from "axios";
import {jwtDecode, JwtPayload} from "jwt-decode";
import Swal from 'sweetalert2';

interface CustomJwtPayload extends JwtPayload {
  id: string;
}
function Profile() {
  const { user, updateUser, fetchUser } = useStore();
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
  
  const [suggestedUsers, setSuggestedUsers] = useState<UsersType[]>([]);
  const defaultProfilePic = "https://tse1.mm.bing.net/th?id=OIP.Br5ihkw7BCVc-bdbrr-PxgHaHa&pid=Api&P=0&h=180";
  const defaultBannerPic = "https://tse1.mm.bing.net/th?id=OIP.Kg6YNNbgzoyNhJ_oTdr54gHaCT&pid=Api&P=0&h=180";
  // Sync local state with user data from store
  
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

  

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchUser();
        setLoading(false);
      } catch (error) {
        console.log(error);
        setError('Failed to fetch user data');
        setLoading(false);
      }
    };

    initializeData();
  }, [fetchUser]);

  // Fetch suggested users
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if(!token){
          return;
        }
        const current_user = (jwtDecode(token) as CustomJwtPayload).id;
        const response = await fetch(`https://circle-be-gules.vercel.app/api/users/${current_user}/suggest-users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setSuggestedUsers(data);
      } catch (error) {
        console.log(error);
        setError('An error occurred while fetching suggested users');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, []);

  const getFollowCounts = async (userId: string) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`https://circle-be-gules.vercel.app/api/users/${userId}/follow-counts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);
    return response.data; // { followersCount, followingCount }
  };

  useEffect(() => {
    const fetchFollowCounts = async () => {
      const token = localStorage.getItem("token");
        if(!token){
          return;
        }
        const current_user = (jwtDecode(token) as CustomJwtPayload).id;
      try {
        console.log("the user: ", current_user);
        const counts = await getFollowCounts(current_user.toString());
        setFollowCounts({
          followers: counts.followersCount,
          following: counts.followingCount,
        });
      } catch (error) {
        console.error("Failed to fetch follow counts:", error);
      }
    };
  
    fetchFollowCounts();
  }, []);

  console.log(followCounts)

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
  

  const handleFollowToggle = async (userId: string, isFollowed: boolean) => {
    const updatedUsers = suggestedUsers.map((user) =>
      user.id === userId ? { ...user, isFollowed: !isFollowed } : user
    );
    setSuggestedUsers(updatedUsers);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in again.");

      const decodedToken: { userId: string } = jwtDecode(token);
      const currentUserId = decodedToken.userId;

      const response = await fetch("https://circle-be-gules.vercel.app/api/users/toggle-follow", {
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

      if (!response.ok) throw new Error("Failed to toggle follow");

      const data = await response.json();
      Swal.fire({
        title: "Good job!",
        text: data.message,
        icon: "success"
      });
      // alert(data.message);
    } catch (error: any) {
      // Rollback UI changes on error
      setSuggestedUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isFollowed } : user
        )
      );
      Swal.fire({
        title: "oops",
        text: error.message,
        icon: "error"
      });
      // alert(error.message || "An error occurred while toggling follow");
    }
  };

  if (loading) return <Box>Loading...</Box>;
  if (error) return <Box>Error: {error}</Box>;
  if (!user) return <Box>Please log in to view your profile</Box>;

  

  return (
    <Box bg="gray.800" color="white" minH="100vh" p={5}>
      {/* My Profile Section */}
      <Box bg="gray.800" borderRadius="lg" p={5} mb={6}>
        <Flex justify="space-between" align="center" position="relative" paddingBottom={2}>
          <Image rounded="md" src={user.banner_pic || defaultBannerPic} alt="User image" height={85} width={400} />
          <Avatar size="xl" name={user.username } src={user.profile_pic || defaultProfilePic} position="absolute" bottom={-3} left={3} />
        </Flex>

        {/* Edit Profile Button */}
        <DialogRoot key="md" size="md">
          <DialogTrigger asChild>
            <Button variant="outline" borderColor="whiteAlpha.400" height={8} left={300} borderRadius={30}>
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
          <Heading size="md">{user.fullname}</Heading>
          <Text fontSize="sm" color="gray.400">@{user.username}</Text>
          <Text fontSize="sm">{user.bio}</Text>
          <HStack>
          <Text fontWeight="bold">{followCounts.following}</Text>
          <Text color="gray.400">Following</Text>
          <Text fontWeight="bold">{followCounts.followers}</Text>
          <Text color="gray.400">Followers</Text>
          </HStack>
        </VStack>
      </Box>

      {/* Suggested for You Section */}
      <Box bg="gray.800" borderRadius="lg" p={5} mt={6}>
        <Text fontWeight="bold" mb={4}>
          Suggested for you
        </Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : suggestedUsers && suggestedUsers.length > 0 ? (
          suggestedUsers.map((user) => (
            <Flex
              key={user.id}
              alignItems="center"
              justifyContent="space-between"
              mb={3}
              p={3}
              borderRadius="md"
              _hover={{ bg: "gray.700" }}
            >
              <Flex alignItems="center" gap={3}>
                <Avatar size="sm" src={user.profile_pic || defaultProfilePic} />
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="white">
                    {user.fullname}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    @{user.username}
                  </Text>
                </Box>
              </Flex>
              <Button
                onClick={() => handleFollowToggle(user.id, user.isFollowed)}
                variant={user.isFollowed ? "solid" : "outline"}
                size="sm"
                bg={user.isFollowed ? "gray.600" : "transparent"}
                borderColor="gray.500"
                color="white"
                _hover={{ bg: user.isFollowed ? "gray.500" : "gray.700" }}
              >
                {user.isFollowed ? "Following" : "Follow"}
              </Button>
            </Flex>
          ))
        ) : (
          <Text>No suggested users found</Text>
        )}
      </Box>

      {/* Footer */}
      <Box textAlign="center" mt={10}>
        <Text fontSize="sm" color="gray.500">
          Developed by <Link color="blue.400">Theodore</Link> • Powered by
          <Link color="blue.400" ml={1}>DumbWays Indonesia</Link>
        </Text>
      </Box>
    </Box>
  );
}

export default Profile;

