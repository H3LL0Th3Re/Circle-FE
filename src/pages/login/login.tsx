import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Input,
  Text,
  Heading,
  VStack,
} from "@chakra-ui/react";

import { FormControl} from "@chakra-ui/form-control";
import { toaster } from "@/components/ui/toaster";
import { z } from "zod";
import { useStore } from "@/useStore";
import { Flex } from "@chakra-ui/layout";
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginFormInputs) => {
    
    setError(null);
    navigate("/login");

    try {
      const response = await fetch("https://circle-be-gules.vercel.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const responseData = await response.json();
      // console.log(responseData.user.username);
      toaster.create({
        title: "Login Successful",
        description: `Welcome back ${responseData.user.username}!`,
        type: "success",
        duration: 3000,
      });
      localStorage.setItem("token", responseData.token);
      useStore.getState().login(responseData.token);
      // console.log(responseData.user);
      navigate("/main");
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bg="gray.900"
      p={4}
    >
      <Box
        bg="gray.800"
        p={8}
        borderRadius="lg"
        shadow="lg"
        maxW="400px"
        width="100%"
        color="white"
      >
        <Heading as="h1" size="lg" mb={6} color="green.400">
          circle
        </Heading>
        <Text mb={4} fontSize="lg" fontWeight="bold" color="white">
          Login to Circle
        </Text>
        <form onSubmit={handleSubmit(handleLogin)}>
          <VStack gap={4} align="stretch">
            <FormControl id="username" isRequired>
              <Input
                {...register("username")}
                placeholder="Email/Username"
                bg="gray.700"
                border="1px"
                borderColor="gray.600"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _focus={{ borderColor: "green.400" }}
              />
              {errors.username && (
                <Text color="red.400" fontSize="sm" mt={1}>
                  {errors.username.message}
                </Text>
              )}
            </FormControl>
            <FormControl id="password" isRequired>
              <Input
                {...register("password")}
                type="password"
                placeholder="Password"
                bg="gray.700"
                border="1px"
                borderColor="gray.600"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _focus={{ borderColor: "green.400" }}
              />
              {errors.password && (
                <Text color="red.400" fontSize="sm" mt={1}>
                  {errors.password.message}
                </Text>
              )}
            </FormControl>
            <Flex justify="flex-end">
              <Link to="/forgot" className="text-green-500">
                Forgot password?
              </Link>
            </Flex>
            <Button
              type="submit"
              colorScheme="green"
              bg="green.400"
              _hover={{ bg: "green.500" }}
              // isLoading={loading}
              w="full"
              mt={4}
            >
              Login
            </Button>
            {error && (
              <Text color="red.400" fontSize="sm" textAlign="center" mt={2}>
                {error}
              </Text>
            )}
          </VStack>
        </form>
        <Text mt={6} fontSize="sm" color="gray.400" textAlign="center">
          Don’t have an account yet?{" "}
          <Link to="/" className="text-green-500">
            Create account
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default Login;
