/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Input, 
  Button, 
  VStack, 
  Link
} from '@chakra-ui/react';
import{
  Alert
} from '@/components/ui/alert';
import {
  FormControl,
} from "@chakra-ui/form-control"


type RegisterFormData = {
  email: string;
  username: string;
  fullname?: string;
  password: string;
};

function Register() {

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    username: '',
    fullname: '',
    password: '',
  });

  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData((prev)=>({...prev, [name]: value}));
  };
  const handleSubmitFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('Success:', data);
      setSuccess(true);
      setFormData({
        email: '',
        username: '',
        fullname: '',
        password: '',
      });
    } catch (error:any) {
      console.error('Error:', error);
      setError(error.message || 'Something went wrong');
    } 
  };
  
  return (
    <Box
      bg="gray.900"
      color="white"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box
        w="100%"
        maxW="400px"
        bg="gray.800"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Heading as="h1" size="lg" color="green.400" textAlign="center" mb={4}>
          circle
        </Heading>
        <Text fontSize="xl" textAlign="center" mb={8}>
          Create account Circle
        </Text>
        <form onSubmit={handleSubmitFetch}>
          <VStack gap={4}>
            {error && (
              <Alert status="error" title="Registration Failed"/>
            )}
            {success && (
              <Alert status="success" title="Registration Successful"/>
                
            )}
            <FormControl isRequired>
              <Input
                type="text"
                name="fullname"
                placeholder="Full Name"
                bg="gray.700"
                value={formData.fullname}
                onChange={handleChange}
                borderRadius="md"
              />
            </FormControl>
            <FormControl isRequired>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                bg="gray.700"
                value={formData.username}
                onChange={handleChange}
                borderRadius="md"
              />
            </FormControl>
            <FormControl isRequired>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                bg="gray.700"
                value={formData.email}
                onChange={handleChange}
                borderRadius="md"
              />
            </FormControl>
            <FormControl isRequired>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                bg="gray.700"
                value={formData.password}
                onChange={handleChange}
                borderRadius="md"
              />
            </FormControl>
            <Button
              type="submit"
              bg="green.400"
              color="white"
              _hover={{ bg: 'green.500' }}
              borderRadius="md"
              w="full"
              py={2}
            >
              Create
            </Button>
          </VStack>
        </form>
        <Text mt={4} textAlign="center" fontSize="sm">
          Already have an account?{' '}
          <Link href="https://circle-fe-roan.vercel.app/login" color="green.400">
            Login
          </Link>
        </Text>
      </Box>
    </Box>
  );
}

export default Register;
