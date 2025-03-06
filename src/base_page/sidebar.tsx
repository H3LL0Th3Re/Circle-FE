
import { Box, Heading, Button} from '@chakra-ui/react';

import { FaHome, FaSearch, FaHeart, FaUser, FaSignOutAlt } from 'react-icons/fa';



import { useUser } from "@/userContext";
import { useNavigate } from 'react-router-dom';
// import { useThreadStore } from '@/useThreadStore';
function Sidebar() {
    const { logout } = useUser();
    const navigate = useNavigate();
    

    const handleLogout = () => {
        logout(); // Call the logout function
        // useThreadStore.getState().clearLikeStates();
        navigate("/login"); // Redirect to the login page or another appropriate page
      };
    return (
        <Box
            bg="gray.800"
            width="280px"
            height="100vh"
            display="flex"
            flexDirection="column"
            alignItems="center"
            py={5}
        >
            {/* Logo */}
            {/* <Heading as="h1" fontSize="4x2" color="green.600" mb={1}>
                Circle
            </Heading> */}

            <div className="sidebar">
                <Heading as="h1" fontSize="4x2" color="green.600" mb={1}>
                    Circle
                </Heading>
                <ul>
                    <li>
                        <a href="/main"><FaHome /> Home</a>
                    </li>
                    <li>
                        <a href="/main/search"><FaSearch /> Search</a>
                    </li>
                    <li>
                        <a href="/main/follow"><FaHeart /> Follows</a>
                    </li>
                    <li>
                        <a href="/main/profile-detail"> <FaUser /> Profile</a>
                    </li>
                </ul>
                

                

                    <div className="logout">
                        <Button
                            colorScheme="red"
                            variant="outline"
                            onClick={handleLogout}
                            >
                            <FaSignOutAlt /> Logout
                        </Button>
                    </div>
            </div>
            
        </Box>
        
    );
}

export default Sidebar;
