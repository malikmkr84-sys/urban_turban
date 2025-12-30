
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Users, Shield, ShoppingBag, Package, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// --- Schemas & Types ---
const createUserSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["customer", "employee", "admin"]),
});
type CreateUserFormData = z.infer<typeof createUserSchema>;

// --- Helper Components ---

function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateUserFormData>({
        resolver: zodResolver(createUserSchema),
        defaultValues: { role: "employee" }
    });

    const createMutation = useMutation({
        mutationFn: async (data: CreateUserFormData) => {
            const res = await fetch(api.users.create.path, {
                method: api.users.create.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include"
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || "Failed to create user");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "User created", description: "New user has been added successfully." });
            queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
            reset();
            onSuccess();
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    return (
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="max-w-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wide">Name</label>
                    <input {...register("name")} className="w-full p-2 border bg-background" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wide">Email</label>
                    <input {...register("email")} type="email" className="w-full p-2 border bg-background" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wide">Password</label>
                    <input {...register("password")} type="password" className="w-full p-2 border bg-background" />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wide">Role</label>
                    <select {...register("role")} className="w-full p-2 border bg-background">
                        <option value="customer">Customer</option>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>
            <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-black text-white py-3 font-bold tracking-wide hover:bg-black/90 transition-colors disabled:opacity-70 flex justify-center"
            >
                {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "CREATE USER"}
            </button>
        </form>
    );
}

function UsersList() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: users, isLoading } = useQuery({
        queryKey: [api.users.list.path],
        queryFn: async () => {
            const res = await fetch(api.users.list.path, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch users");
            return res.json();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId: number) => {
            // Construct URL manually since buildUrl helper is not imported or we can just template string it
            // Check routes.ts: path is /api/users/:id
            const res = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || "Failed to delete user");
            }
        },
        onSuccess: () => {
            toast({ title: "User deleted", description: "Employee removed successfully." });
            queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
        },
        onError: (error: Error) => {
            toast({ title: "Deletion failed", description: error.message, variant: "destructive" });
        }
    });

    if (isLoading) return <Loader2 className="w-8 h-8 animate-spin mx-auto" />;

    // Filter: Show ONLY employees
    const employees = (users || []).filter((u: any) => u.role === 'employee');

    // Search
    const filteredEmployees = employees.filter((u: any) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5" /> Employees</h2>
                <input
                    type="text"
                    placeholder="Search employees..."
                    className="border p-2 rounded-md w-64 bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="border border-border divide-y divide-border">
                {filteredEmployees.length === 0 ? (
                    <div className="p-4 text-muted-foreground text-center">No employees found.</div>
                ) : (
                    filteredEmployees.map((u: any) => (
                        <div key={u.id} className="p-4 flex items-center justify-between hover:bg-secondary/5 transition-colors">
                            <div>
                                <p className="font-bold">{u.name}</p>
                                <p className="text-sm text-muted-foreground">{u.email}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                    {u.role}
                                </span>
                                <button
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to delete ${u.name}?`)) {
                                            deleteMutation.mutate(u.id);
                                        }
                                    }}
                                    className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function OrdersList() {
    const { data: orders, isLoading } = useQuery({
        queryKey: [api.orders.list.path],
        queryFn: async () => {
            const res = await fetch(api.orders.list.path, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch orders");
            return res.json();
        }
    });

    const [searchTerm, setSearchTerm] = useState("");

    if (isLoading) return <Loader2 className="w-8 h-8 animate-spin mx-auto" />;

    const filteredOrders = (orders as any[] || []).filter((order) => {
        const searchLower = searchTerm.toLowerCase();
        const customerName = order.user?.name?.toLowerCase() || "";
        const customerEmail = order.user?.email?.toLowerCase() || "";
        const orderId = order.id.toString();

        return orderId.includes(searchLower) ||
            customerName.includes(searchLower) ||
            customerEmail.includes(searchLower);
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> All Orders</h2>
                <input
                    type="text"
                    placeholder="Search by Order ID, Name, or Email..."
                    className="border p-2 rounded-md w-64 md:w-80 bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="border border-border divide-y divide-border">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-bold text-lg">Order #{order.id}</p>
                                <p className="text-sm text-muted-foreground">{new Date(order.created_at || order.createdAt).toLocaleDateString()}</p>
                                {/* Display Customer Name if available (Backend enhancement) */}
                                {order.user && <p className="text-sm font-medium mt-1 text-primary">Customer: {order.user.name} ({order.user.email})</p>}
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">₹{Number(order.total_amount || order.totalAmount).toFixed(2)}</p>
                                <span className={`inline-block px-2 py-1 text-xs font-bold uppercase rounded-full mt-1 ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.status}
                                </span>
                                <p className="text-xs text-muted-foreground mt-1 uppercase">{order.payment_provider || order.paymentProvider}</p>
                            </div>
                        </div>

                        <div className="bg-secondary/20 p-4 rounded-md space-y-2">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.variant?.product?.name} ({item.variant?.color})</span>
                                    <span className="text-muted-foreground">₹{item.price_at_purchase || item.priceAtPurchase}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {(!filteredOrders || filteredOrders.length === 0) && (
                    <div className="p-8 text-center text-muted-foreground">No orders found.</div>
                )}
            </div>
        </div>
    );
}

function ProductsList() {
    const { data: products, isLoading } = useQuery({
        queryKey: [api.products.list.path],
        queryFn: async () => {
            const res = await fetch(api.products.list.path);
            if (!res.ok) throw new Error("Failed to fetch products");
            return res.json();
        }
    });

    if (isLoading) return <Loader2 className="w-8 h-8 animate-spin mx-auto" />;

    return (
        <div className="grid gap-4">
            {(products as any[] || []).map(product => (
                <div key={product.id} className="flex items-center gap-4 p-4 border border-border">
                    <div className="h-16 w-16 bg-secondary/30 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[0] || "/products/placeholder.jpg"} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <img src="/products/placeholder.jpg" alt="" className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold">{product.name}</h3>
                        <div className="text-sm text-muted-foreground flex gap-4">
                            <span>₹{product.price}</span>
                            <span>{product.variants.length} Variants</span>
                            <span>{product.variants.reduce((acc: number, v: any) => acc + v.stock_quantity, 0)} in stock</span>
                        </div>
                    </div>
                    <div className={`px-2 py-1 text-xs font-bold uppercase ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                    </div>
                </div>
            ))}
        </div>
    )
}

// --- Main Component ---

export default function AdminDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const [, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'products'>('users');
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    if (authLoading) return null;

    if (!user || user.role !== 'admin') {
        setLocation("/");
        return null;
    }

    return (
        <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="font-display text-4xl mb-2">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage users, orders, and products.</p>
                </div>

                {activeTab === 'users' && (
                    <button
                        onClick={() => setIsCreatingUser(!isCreatingUser)}
                        className="bg-primary text-primary-foreground px-4 py-2 font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                        {isCreatingUser ? "Cancel" : <><Plus className="w-4 h-4" /> Add User</>}
                    </button>
                )}
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-border mb-8">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Users</span>
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> All Orders</span>
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'products' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <span className="flex items-center gap-2"><Package className="w-4 h-4" /> Products</span>
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'users' && (
                    <>
                        {isCreatingUser && (
                            <div className="mb-12 border p-6 bg-secondary/10">
                                <h2 className="text-xl font-bold mb-6">Create New User</h2>
                                <CreateUserForm onSuccess={() => setIsCreatingUser(false)} />
                            </div>
                        )}
                        <UsersList />
                    </>
                )}

                {activeTab === 'orders' && <OrdersList />}

                {activeTab === 'products' && <ProductsList />}
            </div>
        </div>
    );
}
