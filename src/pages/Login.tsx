import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { redirectByRole } from "@/utils/redirectByRole";

// Icon Imports (Using inline SVGs for simplicity and consistency)
const UserIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const KeyIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20 20-3.5-3.5"/><path d="M17.5 13.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0"/><path d="M6.5 10A7 7 0 1 1 17 4.5 7 7 0 0 1 6.5 10Z"/></svg>;
const MailIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const LockIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const CheckIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
const LoaderIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9"/><path d="M7 12h2a1 1 0 0 0 0-2H7v2"/><path d="M12 7v2a1 1 0 0 0 2 0V7a1 1 0 0 0-2 0z"/></svg>;


// API calls
import {
  loginWithPassword,
  sendLoginOtp,
  verifyLoginOtp,
} from "@/api/auth";

// --- Framer Motion Variants ---
const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
};


export default function Login() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const { login } = useAuth();

  // Tabs
  const [tab, setTab] = useState<"password" | "otp">("password");

  // Password Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP Login States
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Inline feedback message (styled instead of alert)
  const [feedback, setFeedback] = useState<null | { type: "success" | "error"; text: string }>(null);
  const showMessage = (text: string, type: "success" | "error" = "error") => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // 🔐 PASSWORD LOGIN
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginWithPassword(email, password);

      login(data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); 

      const redirectPath = redirectByRole(data.user.role);
      navigate(redirectPath);
    } catch (err: any) {
      const status = err?.response?.status;
      const backendMsg: string | undefined = err?.response?.data?.message;

      if (status === 403 && (backendMsg?.includes("Account not verified") || backendMsg?.includes("verify"))) {
        setTab("otp");
        setOtpEmail(email);
        showMessage(
          "Your account is not verified. Please verify using the OTP method.",
          "error"
        );
      } else if (status === 401) {
        showMessage("Invalid email or password", "error");
      } else if (err?.code === "ERR_NETWORK") {
        showMessage("Cannot reach server. Check backend connection.", "error");
      } else {
        showMessage(backendMsg || "Login failed", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // 📨 SEND OTP
  const handleSendOtp = async () => {
    if (!otpEmail) {
      showMessage("Enter email", "error");
      return;
    }
    setSendingOtp(true);

    try {
      await sendLoginOtp(otpEmail);
      setOtpSent(true);
      showMessage("OTP sent to your email", "success");
    } catch (err: any) {
      showMessage(err?.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setSendingOtp(false);
    }
  };

  // 🔓 VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || !otpEmail) {
      showMessage("Enter email + OTP", "error");
      return;
    }
    setVerifyingOtp(true);

    try {
      const data = await verifyLoginOtp(otpEmail, otpCode);

      login(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const redirectPath = redirectByRole(data.user.role);
      navigate(redirectPath);
    } catch (err: any) {
      showMessage(err?.response?.data?.message || "OTP verify failed", "error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // --- Input Component Helper (FINAL CORRECTED LOGIC) ---
  // The type parameter T is used to correctly type the input change event.
  const InputField = <T extends string | number | readonly string[] | undefined>({ 
    label, 
    type, 
    value, 
    onChange, 
    placeholder, 
    icon: Icon, 
    disabled = false, 
    className = '' 
  }: {
    label: string;
    type: string;
    value: T;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Corrected Event Type
    placeholder: string;
    icon: (props: any) => JSX.Element;
    disabled?: boolean;
    className?: string;
  }) => (
    <div className="relative">
      <label 
        className={`block text-sm font-medium transition-colors ${dark ? "text-gray-400" : "text-slate-600"}`}
      >
        {label}
      </label>
      <div className="relative mt-1">
        <input
          type={type}
          value={value}
          // The issue was in how the event propagates. Passing the raw event handler directly is the most robust fix.
          onChange={onChange} 
          placeholder={placeholder}
          disabled={disabled}
          required={!disabled && label !== 'Enter OTP Code'}
          className={`w-full rounded-xl p-3 pl-11 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 ${
            dark 
              ? "bg-gray-800 text-white border border-gray-700 placeholder-gray-500 hover:border-blue-500/50" 
              : "bg-white text-slate-900 border border-gray-300 placeholder-gray-400 hover:border-blue-500/50"
          } ${disabled ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
        />
        {Icon && (
          <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition duration-500 ${
        dark
          ? "bg-gray-900"
          : "bg-gray-50"
      }`}
    >
        {/* Background Decorative Element 1 */}
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob dark:opacity-20 dark:bg-blue-600" 
          style={{ background: dark ? '#2563EB' : '#A7F3D0', animationDelay: '2s' }}
        ></div>
        {/* Background Decorative Element 2 */}
        <div 
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob dark:opacity-20 dark:bg-purple-600" 
          style={{ background: dark ? '#9333EA' : '#FDE68A', animationDelay: '4s' }}
        ></div>

      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full max-w-lg rounded-2xl p-8 z-10 transition-shadow duration-500 ${
          dark
            ? "bg-gray-900/70 shadow-2xl shadow-black/50 border border-gray-700"
            : "bg-white shadow-2xl border border-gray-200"
        } backdrop-blur-md`}
      >
        <div className="flex justify-center mb-6">
             <UserIcon className={`h-12 w-12 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
        <h2
          className={`text-3xl font-extrabold text-center transition-colors ${
            dark ? "text-white" : "text-slate-900"
          }`}
        >
          Login
        </h2>
        <p className={`text-center mt-2 mb-6 ${dark ? "text-gray-400" : "text-slate-500"}`}>
            Sign in to access your student portal.
        </p>

        {/* Styled inline feedback message */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`mt-4 mb-2 rounded-xl border p-3 text-sm transition-colors ${
              feedback.type === "error"
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-green-500/10 border-green-500/30 text-green-400"
            }`}
          >
            {feedback.text}
          </motion.div>
        )}

        {/* TABS */}
        <div 
            className={`mt-6 grid grid-cols-2 gap-1 rounded-xl p-1 transition-colors ${dark ? 'bg-gray-800' : 'bg-gray-200'}`}
            role="tablist"
        >
          <motion.button
            onClick={() => setTab("password")}
            className={`py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              tab === "password"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : dark
                ? "text-gray-300 hover:bg-gray-700"
                : "text-slate-700 hover:bg-white"
            }`}
            whileTap={{ scale: 0.98 }}
            role="tab"
            aria-selected={tab === "password"}
          >
            Password Login
          </motion.button>

          <motion.button
            onClick={() => setTab("otp")}
            className={`py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              tab === "otp"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : dark
                ? "text-gray-300 hover:bg-gray-700"
                : "text-slate-700 hover:bg-white"
            }`}
            whileTap={{ scale: 0.98 }}
            role="tab"
            aria-selected={tab === "otp"}
          >
            OTP Login
          </motion.button>
        </div>

        {/* CONTENT */}
        <motion.div className="mt-6" initial={false} animate={{ height: tab === 'password' ? 'auto' : 'auto' }}>
          {tab === "password" ? (
            <motion.form 
                key="password-form"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.4 }}
                onSubmit={handlePasswordLogin} 
                className="space-y-6"
            >
              {/* Email */}
              <InputField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="you@university.com"
                icon={MailIcon}
              />

              {/* Password */}
              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={LockIcon}
              />

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-lg mt-2 transition-all duration-300 shadow-lg shadow-blue-500/50 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? <LoaderIcon className="animate-spin h-5 w-5" /> : <KeyIcon className="h-5 w-5" />}
                {loading ? "Signing in..." : "Login to Portal"}
              </motion.button>

              <div className="flex justify-between items-center text-sm mt-4">
                <Link to="/register" className="font-medium transition-colors text-blue-500 hover:text-blue-400">
                  Register as Student
                </Link>
                <Link to="/forgot-password" className="font-medium transition-colors text-slate-500 hover:text-blue-500">
                  Forgot Password?
                </Link>
              </div>
            </motion.form>
          ) : (
            <motion.div 
                key="otp-form"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.4 }}
                className="space-y-6"
            >
              {/* OTP Email */}
              <InputField
                label="Email Address"
                type="email"
                value={otpEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtpEmail(e.target.value)}
                placeholder="you@university.com"
                icon={MailIcon}
                disabled={otpSent && !sendingOtp}
              />

              {!otpSent ? (
                <motion.button
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !otpEmail}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-lg transition-all duration-300 shadow-lg shadow-green-500/50 hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {sendingOtp ? <LoaderIcon className="animate-spin h-5 w-5" /> : <MailIcon className="h-5 w-5" />}
                  {sendingOtp ? "Sending OTP..." : "Send Verification OTP"}
                </motion.button>
              ) : (
                <>
                  <p className={`text-sm text-center ${dark ? 'text-green-400' : 'text-green-600'}`}>
                    OTP sent. Check your inbox and spam folder.
                  </p>
                  
                  {/* OTP Input */}
                  <InputField
                    label="Enter OTP Code"
                    type="text"
                    value={otpCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    icon={CheckIcon}
                  />

                  <div className="flex gap-4">
                    <motion.button
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || !otpCode}
                      className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold transition-all duration-300 shadow-lg shadow-blue-500/50 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {verifyingOtp ? <LoaderIcon className="animate-spin h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
                      {verifyingOtp ? "Verifying..." : "Verify & Login"}
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode("");
                      }}
                      className="py-3 px-4 rounded-xl border font-semibold transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Resend
                    </motion.button>
                  </div>
                </>
              )}

              <div className="text-sm text-center pt-2">
                <Link to="/register" className="font-medium transition-colors text-blue-500 hover:text-blue-400">
                  Register as Student
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}