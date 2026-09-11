"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Camera,
  LogOut,
  Shield,
  Bell,
  Sun,
  Moon,
  Settings,
  UserCircle,
  Key,
  Activity,
  Crown,
  Sparkles,
  Zap,
  Building2,
  TrendingUp,
  Check,
  Star,
  Calendar,
  Clock,
  BarChart3,
  Scan,
  Languages,
  MonitorSmartphone,
  AlertCircle as AlertIcon,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PasswordInput, {
  usePasswordValidation,
} from "@/app/auth/paswordVaildation";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface Subscription {
  id: string;
  user_id: string;
  razorpay_customer_id: string;
  razorpay_subscription_id: string;
  razorpay_payment_id?: string;
  plan_id: string;
  plan_name: string;
  status: string;
  amount: number;
  currency: string;
  interval: string;
  features: {
    reviewScanLimit: number;
    languages: string[];
    alerts: string;
    qrStandee: string;
    analytics: string;
    locations: number | string;
    qrCodes: string;
  };
  current_usage: {
    scansUsed: number;
    lastResetDate: string | null;
  };
  current_period_start: string;
  current_period_end: string;
  remaining_scans: number;
  is_active: boolean;
  is_expired: boolean;
  scan_limit: number;
  scans_used: number;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "subscription"
  >("profile");

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Password form state
  const {
    password: newPassword,
    validation: passwordValidation,
    isValid: isPasswordValid,
    handlePasswordChange: handleNewPasswordChange,
    setPassword: setNewPassword,
  } = usePasswordValidation("", true);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    fetchUserProfile();
    fetchUserSubscription();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!authUser) {
        router.push("/auth/login");
        return;
      }

      setUser({
        id: authUser.id,
        email: authUser.email || "",
        full_name: authUser.user_metadata?.full_name || "",
        avatar_url: authUser.user_metadata?.avatar_url || "",
        created_at: authUser.created_at,
      });

      setEmail(authUser.email || "");
      setFullName(authUser.user_metadata?.full_name || "");
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch("/api/subscription");
      const data = await response.json();

      if (data.success && data.subscription) {
        setSubscription(data.subscription);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      });

      if (error) throw error;

      setUser((prev) => ({
        ...prev!,
        full_name: fullName,
      }));

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!isPasswordValid) {
      setPasswordError("Please meet all password requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setResettingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error(error.message || "Failed to reset password");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !currentUser) {
        throw new Error("User not authenticated");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `avatar-${currentUser.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl,
        },
      });

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      setUser((prev) => ({
        ...prev!,
        avatar_url: avatarUrl,
      }));

      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);

      if (error.message?.includes("Bucket not found")) {
        toast.error("Storage bucket not found. Please contact support.");
      } else if (error.message?.includes("row-level security")) {
        toast.error(
          "Permission denied. Please check your storage permissions.",
        );
      } else if (error.message?.includes("duplicate")) {
        toast.error("File already exists. Please try again.");
      } else {
        toast.error(error.message || "Failed to upload avatar");
      }
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanIcon = (planName: string) => {
    const name = planName?.toUpperCase() || "";
    if (name.includes("ENTERPRISE")) return Building2;
    if (name.includes("GROWTH")) return Zap;
    if (name.includes("STARTER")) return Sparkles;
    return Crown;
  };

  const getPlanColor = (planName: string) => {
    const name = planName?.toUpperCase() || "";
    if (name.includes("ENTERPRISE")) return "from-purple-600 to-indigo-600";
    if (name.includes("GROWTH")) return "from-blue-600 to-indigo-600";
    if (name.includes("STARTER")) return "from-emerald-600 to-teal-600";
    return "from-gray-600 to-slate-600";
  };

  const getPlanBadge = (planName: string) => {
    const name = planName?.toUpperCase() || "";
    if (name.includes("ENTERPRISE")) return "Enterprise";
    if (name.includes("GROWTH")) return "Growth";
    if (name.includes("STARTER")) return "Starter";
    return "Free";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "expired":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Loading profile...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your profile, security, and subscription
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab("profile")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === "profile"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === "security"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === "subscription"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Crown className="inline h-4 w-4 mr-1" />
              Plan
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="border-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-6 backdrop-blur-sm dark:from-indigo-950/30 dark:to-purple-950/30">
            <div className="flex flex-col items-center space-y-4">
              {/* Avatar */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-xl dark:border-slate-800">
                  {user?.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                      loading="eager"
                      priority={true}
                      sizes="128px"
                      quality={85}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-4xl font-bold text-white">
                      {fullName?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                  )}
                </div>

                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 cursor-pointer rounded-full bg-indigo-600 p-2 text-white shadow-lg transition-all hover:bg-indigo-700 hover:scale-110 ${
                    isUploadingAvatar ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  />
                </label>
              </motion.div>

              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {fullName || "User"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>

              {/* Subscription Badge */}
              {subscription && (
                <div className="w-full">
                  <div className={`rounded-lg bg-gradient-to-r ${getPlanColor(subscription.plan_name)} p-3 text-center text-white shadow-lg`}>
                    <div className="flex items-center justify-center gap-2">
                      {React.createElement(getPlanIcon(subscription.plan_name), { className: "h-4 w-4" })}
                      <span className="font-bold">{getPlanBadge(subscription.plan_name)} Plan</span>
                    </div>
                    <div className="mt-1 text-xs opacity-90">
                      {subscription.is_active ? "Active" : subscription.status}
                    </div>
                  </div>
                </div>  
              )}

              <div className="w-full space-y-2 border-t border-slate-200/50 pt-4 dark:border-slate-700/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Member since
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatDate(user?.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Status
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <Activity className="h-3 w-3" />
                    Active
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <AnimatePresence mode="wait">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-0 bg-white/80 p-6 backdrop-blur-sm dark:bg-slate-800/80">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <UserCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Profile Information
                      </h3>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label
                          htmlFor="fullName"
                          className="text-slate-700 dark:text-slate-300"
                        >
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="pl-10 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label
                          htmlFor="email"
                          className="text-slate-700 dark:text-slate-300"
                        >
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            disabled
                            className="pl-10 bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Email cannot be changed. Contact support for
                          assistance.
                        </p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-0 bg-white/80 p-6 backdrop-blur-sm dark:bg-slate-800/80">
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Security Settings
                      </h3>
                    </div>

                    {passwordError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {passwordError}
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="newPassword"
                          className="text-slate-700 dark:text-slate-300"
                        >
                          New Password
                        </Label>
                        <PasswordInput
                          id="newPassword"
                          value={newPassword}
                          onChange={handleNewPasswordChange}
                          placeholder="Enter new password"
                          showValidation={true}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-slate-700 dark:text-slate-300"
                        >
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="confirmPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className={`pl-10 pr-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:ring-2 ${
                              confirmPassword &&
                              newPassword &&
                              confirmPassword !== newPassword
                                ? "border-red-400 dark:border-red-500 focus:ring-red-500"
                                : confirmPassword &&
                                    newPassword &&
                                    confirmPassword === newPassword
                                  ? "border-green-400 dark:border-green-500 focus:ring-green-500"
                                  : "focus:ring-indigo-500"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          {confirmPassword && newPassword && (
                            <div className="absolute right-12 top-1/2 -translate-y-1/2">
                              {confirmPassword === newPassword ? (
                                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-400 dark:text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                        {confirmPassword && newPassword && (
                          <p
                            className={`text-xs ${
                              confirmPassword === newPassword
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {confirmPassword === newPassword
                              ? "✓ Passwords match"
                              : "✗ Passwords do not match"}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        resettingPassword ||
                        !newPassword ||
                        !confirmPassword ||
                        !isPasswordValid
                      }
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:opacity-50"
                    >
                      {resettingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <Key className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>

                    {newPassword && passwordValidation && (
                      <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            <p className="font-medium">
                              Password Requirements:
                            </p>
                            <ul className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
                              <li
                                className={
                                  passwordValidation.isValidLength
                                    ? "text-green-600 dark:text-green-400"
                                    : ""
                                }
                              >
                                {passwordValidation.isValidLength ? "✓" : "○"}{" "}
                                Minimum 8 characters
                              </li>
                              <li
                                className={
                                  passwordValidation.hasUpperCase
                                    ? "text-green-600 dark:text-green-400"
                                    : ""
                                }
                              >
                                {passwordValidation.hasUpperCase ? "✓" : "○"}{" "}
                                Uppercase letter
                              </li>
                              <li
                                className={
                                  passwordValidation.hasLowerCase
                                    ? "text-green-600 dark:text-green-400"
                                    : ""
                                }
                              >
                                {passwordValidation.hasLowerCase ? "✓" : "○"}{" "}
                                Lowercase letter
                              </li>
                              <li
                                className={
                                  passwordValidation.hasNumbers
                                    ? "text-green-600 dark:text-green-400"
                                    : ""
                                }
                              >
                                {passwordValidation.hasNumbers ? "✓" : "○"}{" "}
                                Number
                              </li>
                              <li className="col-span-2 text-xs text-blue-500 dark:text-blue-400">
                                {passwordValidation.hasSpecialChar ? "✓" : "○"}{" "}
                                Special character (!@#$%^&*)
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </Card>
              </motion.div>
            )}

            {/* Subscription Tab */}
            {activeTab === "subscription" && (
              <motion.div
                key="subscription"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-0 bg-white/80 p-6 backdrop-blur-sm dark:bg-slate-800/80">
                  {subscription ? (
                    <div className="space-y-6">
                      {/* Plan Header */}
                      <div className={`rounded-xl bg-gradient-to-r ${getPlanColor(subscription.plan_name)} p-6 text-white shadow-lg`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {React.createElement(getPlanIcon(subscription.plan_name), { className: "h-8 w-8" })}
                            <div>
                              <h3 className="text-2xl font-bold">
                                {getPlanBadge(subscription.plan_name)} Plan
                              </h3>
                              <p className="text-sm opacity-90">
                                {subscription.interval === 'yearly' ? 'Annual' : 'Monthly'} Subscription
                              </p>
                            </div>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(subscription.status)}`}>
                            {subscription.is_active ? 'Active' : subscription.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Plan Details Grid */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50">
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Plan Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Price</span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                ₹{(subscription.amount).toLocaleString()}
                                <span className="text-xs text-slate-500">/{subscription.interval === 'yearly' ? 'year' : 'month'}</span>
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Billing</span>
                              <span className="font-medium text-slate-900 dark:text-white capitalize">
                                {subscription.interval}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Status</span>
                              <span className={`font-medium ${
                                subscription.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              }`}>
                                {subscription.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50">
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Usage</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Scans Used</span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {subscription.scans_used} / {subscription.scan_limit}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  (subscription.scans_used / subscription.scan_limit) > 0.8 
                                    ? 'bg-red-500' 
                                    : (subscription.scans_used / subscription.scan_limit) > 0.6 
                                      ? 'bg-yellow-500' 
                                      : 'bg-green-500'
                                }`}
                                style={{ 
                                  width: `${Math.min((subscription.scans_used / subscription.scan_limit) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>Remaining: {subscription.remaining_scans}</span>
                              <span>{Math.round((subscription.scans_used / subscription.scan_limit) * 100)}% used</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      {/* {subscription.features && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Plan Features</h4>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-900/50">
                              <Scan className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {subscription.features.reviewScanLimit} scans/month
                              </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-900/50">
                              <Languages className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {Array.isArray(subscription.features.languages) 
                                  ? subscription.features.languages.join(', ') 
                                  : subscription.features.languages}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-900/50">
                              <AlertIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {subscription.features.alerts}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-900/50">
                              <MonitorSmartphone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {subscription.features.qrStandee}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-900/50">
                              <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {subscription.features.analytics}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-900/50">
                              <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {typeof subscription.features.locations === 'number' 
                                  ? `${subscription.features.locations} locations` 
                                  : subscription.features.locations}
                              </span>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Dates */}
                      <div className="grid gap-4 sm:grid-cols-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span>Started: {formatDate(subscription.current_period_start)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>Renews: {formatDate(subscription.current_period_end)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          onClick={() => router.push('/dashboard/upgrade')}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade Plan
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => router.push('/dashboard')}
                          className="border-slate-300 dark:border-slate-700"
                        >
                          Go to Dashboard
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 rounded-full bg-slate-100 p-4 w-16 h-16 flex items-center justify-center dark:bg-slate-800">
                        <Crown className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        No Active Subscription
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        You are currently on the Free plan. Upgrade to unlock more features.
                      </p>
                      <Button
                        onClick={() => router.push('/upgrade')}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        View Plans
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}