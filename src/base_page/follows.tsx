/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Box, Text, Flex, Button, Center, Spinner } from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar";
import {jwtDecode} from "jwt-decode";
import * as Tabs from "@radix-ui/react-tabs";
import Swal from "sweetalert2";
import { useFollowStore } from "../FollowStore";

type User = {
  id: string;
  username: string;
  fullname?: string;
  profile_pic?: string;
  bio?: string;
  isFollowing?: boolean;
  isFollowed?: boolean;
};

interface JwtPayload {
  id: string;
  [key: string]: any;
}

const FollowPage = () => {
  const defaultProfilePic = "https://tse1.mm.bing.net/th?id=OIP.Br5ihkw7BCVc-bdbrr-PxgHaHa&pid=Api&P=0&h=180";
  const [tab, setTab] = useState("Following");
  const [loading, setLoading] = useState<boolean>(false);

  const { users, setUsers, toggleUserFollow } = useFollowStore();

  

  const toggleFollow = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if(!token){
        return;
      }
      const currentUserId = (jwtDecode(token) as JwtPayload).id;

      // Optimistically update the UI
      toggleUserFollow(userId);

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

      const data = await response.json();

      if (!response.ok) {
        // Revert the optimistic update if the request failed
        toggleUserFollow(userId);
        Swal.fire({
          title: "Error",
          text: data.message || "Failed to update follow status",
          icon: "error",
        });
        return;
      }

      Swal.fire({
        title: "Success",
        text: data.message,
        icon: "success",
      });
    } catch (error) {
      // Revert the optimistic update on error
      toggleUserFollow(userId);
      console.error("Error toggling follow:", error);
    }
  };

  const fetchData = async () => {

    const token = localStorage.getItem("token");
      if(!token){
        return;
      }
      const currentUserId = (jwtDecode(token) as JwtPayload).id;
    if (!currentUserId) return;
    setLoading(true);

    const headers = {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };

    try {
      const endpoint = tab === "Following" ? "following" : "followers";
      const response = await fetch(
        `https://circle-be-gules.vercel.app/api/users/${currentUserId}/${endpoint}`,
        { headers }
      );
      const data = await response.json();

      // Add isFollowing property to each user
      const usersWithFollowState = data.map((user: User) => ({
        ...user,
        isFollowing: tab === "Following" ? true : user.isFollowing,
      }));
      setUsers(usersWithFollowState);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const renderUserList = () => (
    <Flex direction="column" gap={3} mt={5}>
      {users.length === 0 ? (
        <Text color="gray.400" textAlign="center">
          No users found.
        </Text>
      ) : (
        users.map((user) => (
          <Flex
            key={user.id}
            align="center"
            bg="gray.800"
            p={4}
            borderRadius="md"
            justify="space-between"
          >
            <Flex align="center" gap={3}>
              <Avatar
                src={user?.profile_pic || defaultProfilePic}
                name={user.username}
                size="sm"
              />
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
              size="sm"
              bg={user.isFollowing ? "gray.700" : "blue.400"}
              color={user.isFollowing ? "green.400" : "white"}
              _hover={{ bg: user.isFollowing ? "gray.600" : "blue.300" }}
              onClick={() => toggleFollow(user.id)}
            >
              {user.isFollowing ? "Following" : "Follow"}
            </Button>
          </Flex>
        ))
      )}
    </Flex>
  );

  return (
    <Box bg="gray.800" color="white" minH="100vh" p={5}>
      <Flex align="center" justify="center" mb={5}>
        <Text fontSize="2xl" fontWeight="bold">
          Follows
        </Text>
      </Flex>
      <Tabs.Root value={tab} onValueChange={(value: string) => setTab(value)}>
        <Tabs.List
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "40px",
            borderBottom: "1px solid gray",
            paddingBottom: "8px",
          }}
        >
          <Tabs.Trigger
            value="Following"
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              color: tab === "Following" ? "white" : "gray",
              fontWeight: tab === "Following" ? "bold" : "normal",
              borderBottom: tab === "Following" ? "2px solid green" : "none",
            }}
          >
            Following
          </Tabs.Trigger>
          <Tabs.Trigger
            value="Followers"
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              color: tab === "Followers" ? "white" : "gray",
              fontWeight: tab === "Followers" ? "bold" : "normal",
              borderBottom: tab === "Followers" ? "2px solid green" : "none",
            }}
          >
            Followers
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="Following">
          {loading ? <Center><Spinner size="xl" /></Center> : renderUserList()}
        </Tabs.Content>

        <Tabs.Content value="Followers">
          {loading ? <Center><Spinner size="xl" /></Center> : renderUserList()}
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

export default FollowPage;
