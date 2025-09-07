
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { PageHeader } from "@/components/organisms/PageHeader";

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">User not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View your account information"
      />
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="bg-muted/40">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>Microsoft AD User Details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 py-2 border-b">
                <div className="font-medium text-muted-foreground">Name</div>
                <div className="col-span-2">{user.name}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b">
                <div className="font-medium text-muted-foreground">Email</div>
                <div className="col-span-2">{user.email}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b">
                <div className="font-medium text-muted-foreground">Role</div>
                <div className="col-span-2">{user.role}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2">
                <div className="font-medium text-muted-foreground">ID</div>
                <div className="col-span-2 text-muted-foreground">{user.id}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
