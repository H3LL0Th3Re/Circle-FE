
import './App.css';
import { Toaster } from "@/components/ui/toaster";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Register from './pages/register/register.tsx';
import Login from './pages/login/login.tsx';
import Forgot from './pages/forgot_pass/forgot_pass.tsx';
import Renew from './pages/renew_pass/renew_pass.tsx';
import PrivateRoute from './privateroute.tsx';
import PrivateLayout from './pages/layout/PrivateRoute.tsx';
import { UserProvider } from '@/userContext';
// import DetailedImage from './base_page/image_detail.tsx';

function App() {
  return (
    <UserProvider>
      <Router>
        <Toaster />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Register />} />
          <Route path="https://circle-fe-git-main-theodores-projects-0c350258.vercel.app/login" element={<Login />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/renew" element={<Renew />} />
          

          {/* Private Routes */}
          <Route
            path="/main/*"
            element={
              <PrivateRoute>
                <PrivateLayout />
              </PrivateRoute>
            }
          />
          
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
