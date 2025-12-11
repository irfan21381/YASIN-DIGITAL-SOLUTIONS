// src/components/student/Profile.tsx
import React, { useEffect, useState } from "react";
import API from "@/lib/api"; // Assuming this is your configured axios instance
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// --- INTERFACES FOR TYPE SAFETY ---

/** Defines the structure of the data displayed/edited in the form. */
interface StudentProfile {
  fullName: string;
  email: string;
  collegeName: string;
  whatsapp: string;
  city: string;
  nationality: string;
}

// --- MAIN COMPONENT ---
export default function Profile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState<StudentProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Profile Data on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/student/me");

        // Assuming API response structure is: { data: { user: { email }, student: { ...data } } }
        const user = res.data.data.user;
        const student = res.data.data.student;

        const formatted: StudentProfile = {
          fullName: student?.name || "", // 💡 NOTE: The backend sends 'name', but the frontend uses 'fullName'
          email: user.email,
          collegeName: student?.collegeName || "",
          whatsapp: student?.whatsapp || "",
          city: student?.city || "",
          nationality: student?.nationality || "Indian",
        };

        setProfile(formatted);
        setForm(formatted);
      } catch (err) {
        console.error("Profile load failed:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2. Handle Form Changes
  const handleChange = (field: keyof StudentProfile, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // 3. Save Profile Update
  const saveProfile = async () => {
    if (!form) return;

    try {
      const res = await API.put("/student/me", form);
      
      // Update the main profile state from the response data to ensure consistency
      const studentData = res.data.data.student;
      const newProfile: StudentProfile = {
          ...form,
          fullName: studentData.name, // Use the name returned by the server
          collegeName: studentData.collegeName,
          // etc.
      };

      setProfile(newProfile);
      setForm(newProfile);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error("Update failed. Please try again.");
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (!profile || !form) return <div className="p-6">Profile data not available.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Profile</h2>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing((prev) => !prev);
              setForm(profile); // Reset form state to the last saved profile
            }}
            className="px-3 py-2 border rounded transition hover:bg-gray-50"
          >
            {editing ? "Cancel" : "Edit"}
          </button>

          <button
            onClick={logout}
            className="px-3 py-2 rounded bg-red-600 text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Full Name" 
            value={form.fullName} 
            disabled={!editing} 
            onChange={(v) => handleChange("fullName", v)} 
          />

          <Input 
            label="Email" 
            value={form.email} 
            disabled 
          />

          <Input 
            label="College Name" 
            value={form.collegeName} 
            disabled={!editing} 
            onChange={(v) => handleChange("collegeName", v)} 
          />

          <Input 
            label="WhatsApp Number" 
            value={form.whatsapp} 
            disabled={!editing} 
            onChange={(v) => handleChange("whatsapp", v)} 
          />

          <Input 
            label="City" 
            value={form.city} 
            disabled={!editing} 
            onChange={(v) => handleChange("city", v)} 
          />

          <Input 
            label="Nationality" 
            value={form.nationality} 
            disabled={!editing} 
            onChange={(v) => handleChange("nationality", v)} 
          />
        </div>

        {editing && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={saveProfile}
              className="px-4 py-2 rounded bg-blue-600 text-white transition hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- INPUT COMPONENT ---
const Input = ({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange?: (v: string) => void;
}) => (
  <div>
    <label className="text-sm text-gray-600 font-medium">{label}</label>
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => onChange && onChange(e.target.value)}
      className={`mt-1 w-full p-3 rounded border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition ${
        disabled ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />
  </div>
);