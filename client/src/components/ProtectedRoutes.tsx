import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Link, Route, useLocation } from "wouter";

interface ProtectedRouteProps {
    component: React.ComponentType<any>;
    path: string;
    requiredRole?: 'customer' | 'admin' | 'employee';
}

export default function ProtectedRoute({ component: Component, path, requiredRole }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Route path={path}>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-border" />
                </div>
            </Route>
        );
    }

    if (!user) {
        return (
            <Route path={path}>
                <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                    <h1 className="text-2xl font-bold">Authentication Required</h1>
                    <p className="text-muted-foreground">Please sign in to access this page.</p>
                    <Link href={`/login?redirect=${encodeURIComponent(path)}`}>
                        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90">
                            Sign In
                        </button>
                    </Link>
                </div>
            </Route>
        );
    }

    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        // Admin can access everything, otherwise role must match
        return (
            <Route path={path}>
                <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-muted-foreground">You do not have permission to view this page.</p>
                    <Link href="/">
                        <button className="text-primary hover:underline">
                            Return Home
                        </button>
                    </Link>
                </div>
            </Route>
        );
    }

    return <Route path={path} component={Component} />;
}
