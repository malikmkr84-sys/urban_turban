import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Login() {
  const [isLoginView, setIsLoginView] = useState(true);
  const { login, isLoggingIn, register, isRegistering, user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get("returnUrl");
    if (returnUrl) {
      setLocation(returnUrl);
    } else {
      setLocation("/profile");
    }
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl mb-4">{isLoginView ? "Welcome Back" : "Join UrbanTurban"}</h1>
          <p className="text-muted-foreground">
            {isLoginView ? "Sign in to access your account." : "Create an account to track orders and checkout faster."}
          </p>
        </div>

        {isLoginView ? (
          <LoginForm
            onSubmit={(data) => login(data)}
            isLoading={isLoggingIn}
            toggleView={() => setIsLoginView(false)}
          />
        ) : (
          <RegisterForm
            onSubmit={(data) => register(data)}
            isLoading={isRegistering}
            toggleView={() => setIsLoginView(true)}
          />
        )}
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading, toggleView }: { onSubmit: (d: LoginFormData) => void, isLoading: boolean, toggleView: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wide">Email</label>
        <input
          {...register("email")}
          type="email"
          className="w-full p-3 bg-transparent border border-border focus:border-primary focus:outline-none transition-colors"
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wide">Password</label>
        <input
          {...register("password")}
          type="password"
          className="w-full p-3 bg-transparent border border-border focus:border-primary focus:outline-none transition-colors"
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white py-3 font-bold tracking-wide hover:bg-black/90 transition-colors disabled:opacity-70 flex justify-center"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIGN IN"}
      </button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <button type="button" onClick={toggleView} className="font-bold hover:underline">Register</button>
      </div>
    </form>
  );
}

function RegisterForm({ onSubmit, isLoading, toggleView }: { onSubmit: (d: RegisterFormData) => void, isLoading: boolean, toggleView: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wide">Name</label>
        <input
          {...register("name")}
          type="text"
          className="w-full p-3 bg-transparent border border-border focus:border-primary focus:outline-none transition-colors"
          placeholder="John Doe"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wide">Email</label>
        <input
          {...register("email")}
          type="email"
          className="w-full p-3 bg-transparent border border-border focus:border-primary focus:outline-none transition-colors"
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wide">Password</label>
        <input
          {...register("password")}
          type="password"
          className="w-full p-3 bg-transparent border border-border focus:border-primary focus:outline-none transition-colors"
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white py-3 font-bold tracking-wide hover:bg-black/90 transition-colors disabled:opacity-70 flex justify-center"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "CREATE ACCOUNT"}
      </button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <button type="button" onClick={toggleView} className="font-bold hover:underline">Log In</button>
      </div>
    </form>
  );
}
