import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import BlogManagement from "@/components/admin/BlogManagement";

const BlogManagementPage = () => {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Blog Management</h1>
          <BlogManagement />
        </div>
      </div>
    </div>
  );
};

export default BlogManagementPage;
