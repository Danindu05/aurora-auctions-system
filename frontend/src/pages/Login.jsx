import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Lock, Mail } from "lucide-react";

import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data);
      toast.success("Welcome back to Aurora Auctions");
      navigate("/");
    } catch (error) {
      console.error("Login failed", error);
      toast.error(error?.response?.data?.message || "Invalid credentials");
    }
  });

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center bg-hero-pattern py-16">
      <Toaster position="top-right" />
      <div className="card-lux w-full max-w-md space-y-8 p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lux">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="font-playfair text-3xl text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to continue your bidding journey.</p>
        </div>
        <form className="space-y-5 text-left" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</label>
            <div className="flex items-center rounded-full border border-emerald-100 bg-white px-4">
              <Mail className="h-4 w-4 text-emerald-600" />
              <input
                type="email"
                className="w-full border-none bg-transparent px-3 py-3 text-sm focus:outline-none"
                placeholder="you@example.com"
                {...register("email", { required: true })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Password</label>
            <div className="flex items-center rounded-full border border-emerald-100 bg-white px-4">
              <Lock className="h-4 w-4 text-emerald-600" />
              <input
                type="password"
                className="w-full border-none bg-transparent px-3 py-3 text-sm focus:outline-none"
                placeholder="Your password"
                {...register("password", { required: true })}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="text-sm text-gray-500">
          Don't have an account? <button className="font-medium text-emerald-700" onClick={() => navigate("/register")}>Create one</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
