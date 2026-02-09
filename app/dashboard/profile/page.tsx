"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

interface Profile {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  avatar_color: string | null;
  role: string;
  username: string | null;
}

const AVATAR_COLORS = [
  { name: "Indigo", value: "6366f1" },
  { name: "Blue", value: "3b82f6" },
  { name: "Cyan", value: "06b6d4" },
  { name: "Emerald", value: "10b981" },
  { name: "Amber", value: "f59e0b" },
  { name: "Rose", value: "f43f5e" },
  { name: "Purple", value: "a855f7" },
  { name: "Slate", value: "64748b" },
];

export default function ProfilePage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
    avatar_color: "6366f1",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUser(user);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile");
          return;
        }

        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || "",
            bio: data.bio || "",
            avatar_url: data.avatar_url || "",
            avatar_color: data.avatar_color || "6366f1",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // If bucket doesn't exist, create it
        if (uploadError.message.includes("not found")) {
          toast.error("Avatar storage not configured. Please contact support.");
          return;
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Image uploaded! Click Save to update your profile.");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar_url: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: formData.full_name || null,
          bio: formData.bio || null,
          avatar_url: formData.avatar_url || null,
          avatar_color: formData.avatar_color,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Profile updated successfully!");

      // Refresh profile data
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getAvatarUrl = () => {
    if (formData.avatar_url) return formData.avatar_url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      formData.full_name || user?.email || "U"
    )}&background=${formData.avatar_color}&color=fff&size=80`;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-base-300 rounded w-1/4"></div>
            <div className="h-64 bg-base-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Profile</h1>
          <p className="text-base-content/70 mt-1">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="relative">
                <div className="avatar">
                  <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={getAvatarUrl()} alt="Avatar" />
                  </div>
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <span className="loading loading-spinner loading-md text-white"></span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">
                  {formData.full_name || user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-sm text-base-content/60">{user?.email}</p>
                <div className="badge badge-primary badge-sm mt-1 capitalize">
                  {profile?.role || "member"}
                </div>
                <div className="flex gap-2 mt-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="btn btn-sm btn-outline"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Photo
                  </button>
                  {formData.avatar_url && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="btn btn-sm btn-ghost text-error"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Avatar Color Picker (only shown when no custom avatar) */}
            {!formData.avatar_url && (
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Avatar Color</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar_color: color.value }))}
                      className={`w-10 h-10 rounded-full transition-all ${
                        formData.avatar_color === color.value
                          ? "ring-2 ring-offset-2 ring-base-content scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: `#${color.value}` }}
                      title={color.name}
                    />
                  ))}
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Choose a color for your generated avatar
                  </span>
                </label>
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="input input-bordered w-full"
                />
              </div>

              {/* Bio */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bio</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  className="textarea textarea-bordered w-full h-24"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    A short description about you
                  </span>
                </label>
              </div>

              {/* Email (Read-only) */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="input input-bordered w-full bg-base-200"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Email cannot be changed
                  </span>
                </label>
              </div>

              {/* Role (Read-only) */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Role</span>
                </label>
                <input
                  type="text"
                  value={profile?.role || "member"}
                  disabled
                  className="input input-bordered w-full bg-base-200 capitalize"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Role is assigned by administrators
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary w-full"
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg">Account Information</h2>
            <div className="divider my-2"></div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-base-content/60">User ID</span>
                <span className="font-mono text-xs">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Created</span>
                <span>
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Last Sign In</span>
                <span>
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
