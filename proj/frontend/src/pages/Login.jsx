import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Zap } from "lucide-react";
import { useAuth } from "../context/useAuth";

const Login = () => {
  const { login, googleLogin, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      toast.success("Welcome back");
      navigate("/");
    } catch (err) {
      const message = err?.response?.data?.message || "Invalid email or password";
      setError(message);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await googleLogin({
        email: "demo.candidate@gmail.com",
        name: "Demo Candidate",
        googleId: "google-oauth-" + Date.now(),
      });
      toast.success("Signed in with Google!");
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <Zap aria-hidden="true" size={26} fill="currentColor" strokeWidth={0} />
          <h1 className="text-2xl font-semibold tracking-tight">JobTracker</h1>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
          <h2 className="text-white text-xl font-semibold mb-1">Welcome back</h2>
          <p className="text-[var(--text-2)] text-sm mb-6">Log in to keep tracking your applications</p>

          {error && (
            <div className="alert-error mb-5" role="alert">
              {error}
            </div>
          )}

          {/* Google OAuth Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full !h-11 rounded-xl flex items-center justify-center gap-3 font-medium text-sm transition-all border border-[var(--border)] hover:border-white/20 bg-white/5 hover:bg-white/10 text-white mb-5 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? "Connecting Google..." : "Continue with Google"}</span>
          </button>

          <div className="flex items-center gap-3 my-4">
            <span className="h-px bg-[var(--border)] flex-1" />
            <span className="caption text-xs uppercase">or with email</span>
            <span className="h-px bg-[var(--border)] flex-1" />
          </div>

          <div className="mb-4">
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input"
            />
          </div>

          <div className="mb-6">
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full !h-11"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <p className="text-[var(--text-2)] text-sm text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[var(--accent)] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
