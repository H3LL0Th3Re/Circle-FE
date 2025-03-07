/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Box,
  Input,
  Text,
  Center,
  Flex,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { IoSearchOutline } from "react-icons/io5";
import { Avatar } from "@/components/ui/avatar"
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { useFollowStore } from "../FollowStore";


interface JwtPayload {
  id: string;
  [key: string]: any;
}

interface User{
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
function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { searchResults, setSearchResults, toggleSearchResultFollow } = useFollowStore();
  const defaultProfilePic = "https://tse1.mm.bing.net/th?id=OIP.Br5ihkw7BCVc-bdbrr-PxgHaHa&pid=Api&P=0&h=180";
  

  const handleSearch = async () => {

    const token = localStorage.getItem("token");
    if(!token){
      return;
    }
    const currentUserId = (jwtDecode(token) as JwtPayload).id;
    if (!query.trim()) return;
  
    setLoading(true);
    try {
      const response = await fetch(
        `https://circle-be-gules.vercel.app/api/users/search?query=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        const filteredResults = data.filter((user: User) => user.id !== currentUserId);
        
        // Get the current follow states from existing search results
        const existingFollowStates = new Map(
          searchResults.map(user => [user.id, user.isFollowed])
        );
  
        // Preserve follow states when updating search results
        const updatedResults = filteredResults.map((user: User) => ({
          ...user,
          isFollowed: existingFollowStates.has(user.id) 
            ? existingFollowStates.get(user.id)  // Keep existing follow state
            : user.isFollowed || false  // Use API value or default to false
        }));
  
        setSearchResults(updatedResults);
      } else {
        console.error("Failed to fetch search results.");
      }
    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId: string) => {
    try {
      // Optimistically update the UI through the store
      toggleSearchResultFollow(userId);

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

      if (!response.ok) {
        // Revert the optimistic update on error
        toggleSearchResultFollow(userId);
        throw new Error("Failed to toggle follow");
      }

      const data = await response.json();
      Swal.fire({
        title: "Success",
        text: data.message,
        icon: "success"
      });
    } catch (error: any) {
      // The store update has already been reverted above if needed
      Swal.fire({
        title: "Error",
        text: error.message || "An error occurred while toggling follow",
        icon: "error"
      });
    }
  };

  return (
    <Box color="white" minH="100vh" p={5}>
      <Center>
        <Flex w="full" bg="gray.800" borderRadius="full" alignItems="center" p={2} mb={10}>
          <IoSearchOutline />
          <Input
            placeholder="Search your friend"
            ml={4}
            _placeholder={{ color: "gray.500" }}
            flex="1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={handleSearch} ml={2} colorScheme="blue">
            Search
          </Button>
        </Flex>
      </Center>

      {loading && (
        <Center mt={10}>
          <Spinner size="lg" />
        </Center>
      )}

      <Box mt={10}>
        {searchResults.map((user) => (
          <Flex key={user.id} p={4} align="center" bg="gray.800" borderRadius="md" mb={4}>
            <Avatar src={user.profile_pic || defaultProfilePic} name={user.username} />
            <Box ml={4} flex="1">
              <Text fontWeight="bold">{user.fullname || "No name provided"}</Text>
              <Text fontSize="sm" color="gray.400">
                @{user.username}
              </Text>
            </Box>
            <Button
              onClick={() => handleFollowToggle(user.id)}
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
        ))}
      </Box>

      {!loading && searchResults.length === 0 && query.trim() && (
        <Center flexDir="column" mt={20}>
          <Text fontSize="xl" fontWeight="bold">
            No results found
          </Text>
          <Text fontSize="md" color="gray.400" mt={2} textAlign="center">
            Try searching for something else or check the spelling of what you typed.
          </Text>
        </Center>
      )}
    </Box>
  );
}

export default SearchPage;
