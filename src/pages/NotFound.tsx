
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-5">
        <h1 className="text-cannabis-600 text-9xl font-bold">404</h1>
        <h2 className="text-4xl font-bold">Page Not Found</h2>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Return to Main Page</Link>
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
