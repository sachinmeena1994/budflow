
import React, { useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/atoms/icons/Logo";
import { toast } from "sonner";
import { MicrosoftIcon } from "@/components/atoms/icons/MicrosoftIcon";
import { useNavigate } from "react-router-dom"
const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
const navigate =useNavigate()
  const handleLoginWithMicrosoft = async () => {
    setIsLoggingIn(true);
    setError(null);
    
    try {
      // Simulate SSO authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Login with the admin user (email and password)
      await login("admin@example.com", "password123");
 
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}");
    const welcomeName = loggedUser?.name || "there";

   
      navigate("/productivity");
    } catch (err) {
      setError("Authentication failed. Please try again.");
      toast.error("Login failed. There was an error logging in with Microsoft. Please try again.");
      // Navigate to productivity even on failure
      navigate("/productivity");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-primary/10">
      {/* Video Background with Darker Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/70 z-10"></div>
        <iframe
          src="https://player.vimeo.com/video/945947625?muted=1&autoplay=1&loop=1&background=1&app_id=122963"
          className="w-full h-full object-cover blur-[2px]"
          frameBorder="0"
          allow="autoplay; fullscreen"
          title="Background Cannabis Video"
        ></iframe>
      </div>

      {/* Content Container */}
      <div className="relative z-20 h-full w-full flex flex-col justify-between">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md bg-card shadow-lg rounded-lg p-8 animate-fade-in">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Logo className="scale-150" />
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-6">Welcome to GTI Budflow</h1>
            
            {/* Error Message */}
            {error && (
              <div className="bg-destructive/20 text-destructive p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            
            {/* Login Button - Enhanced UI */}
            <div className="space-y-6">
              <Button
                onClick={handleLoginWithMicrosoft}
                variant="default" 
                className="w-full py-6 text-base font-medium transition-all duration-200 
                  hover:bg-primary/90 focus-visible:ring-offset-2 focus-visible:ring-primary/70
                  active:scale-[0.99] disabled:bg-primary/80"
                loading={isLoggingIn}
                disabled={isLoggingIn}
              >
                <MicrosoftIcon className="h-5 w-5" />
                <span>Login with Microsoft</span>
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Sign in with your company Microsoft account</p>
                <p>to access the GTI Budflow system</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="w-full bg-black/50 backdrop-blur-sm p-4">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/70 text-sm">
              &copy; {new Date().getFullYear()} GTI Budflow. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
        
              </div>
              <div className="flex items-center">
                <div className="h-6 w-px bg-white/20 mx-2"></div>
                <div className="text-white/70 text-sm">BioTrack Certified</div>
              </div>
              <div className="flex items-center">
                <div className="h-6 w-px bg-white/20 mx-2"></div>
                <div className="text-white/70 text-sm">SOC2 Compliant</div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
