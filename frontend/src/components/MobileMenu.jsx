import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken, getTokenPayload } from "../services/auth";

const API = import.meta.env.VITE_API_URL || "";

const MobileMenu = ({ open, onClose }) => {
  const [profile, setProfile] = useState(null);
  const token = getToken();
  const payload = getTokenPayload(token);
  const role = payload?.role || null;

  useEffect(() => {
    if (!token) {
      setProfile(null);
      return undefined;
    }

    let mounted = true;
    fetch(`${API}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load profile");
        return response.json();
      })
      .then((data) => {
        if (!mounted) return;
        setProfile(data);
      })
      .catch(() => {
        if (!mounted) return;
        setProfile({
          name: payload?.name || "",
          email: payload?.email || "",
          role: payload?.role || "member",
        });
      });

    return () => {
      mounted = false;
    };
  }, [token, payload?.role, payload?.email]);

  const isLoggedIn = !!token;
  const isAdmin = role === "admin";
  const profileName = profile?.name || profile?.email || payload?.email || "Profile";
  const profileRole = profile?.role || payload?.role || "member";
  const profileInitials = String(profileName).trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "P";

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="absolute right-0 top-0 w-72 h-full bg-zinc-900 p-6 flex flex-col gap-6">
        {/* Close */}
        <button onClick={onClose} className="self-end text-xl text-gray-400">
          ✕
        </button>

        {/* Menu */}
        <NavLink to="/" onClick={onClose}>
          Home
        </NavLink>

        <NavLink to="/events" onClick={onClose}>
          Events
        </NavLink>

        {/* ❌ HIDE FROM ADMIN */}
        {!isAdmin && (
          <>
            <NavLink to="/contact" onClick={onClose}>
              Contact
            </NavLink>

            <NavLink to="/sell-ticket" onClick={onClose}>
              Sell Your Tickets
            </NavLink>
          </>
        )}

        {/* ✅ ADMIN ONLY */}
        {isAdmin && (
          <NavLink to="/admin" onClick={onClose}>
            Admin Dashboard
          </NavLink>
        )}

        {/* AUTH */}
        {!isLoggedIn ? (
          <>
            <NavLink to="/login" onClick={onClose}>
              Login
            </NavLink>

            <NavLink to="/signup" onClick={onClose}>
              Signup
            </NavLink>
          </>
        ) : (
          <>
            <div className="profile-dropdown-header">
              <span className="profile-dropdown-avatar">{profileInitials}</span>
              <div>
                <span className="profile-dropdown-name">{profileName}</span>
                <span className="profile-dropdown-role">{profileRole}</span>
              </div>
            </div>

            <NavLink
              to="/profile"
              onClick={onClose}
              className="bg-orange-500 text-black text-center py-2 rounded"
            >
              Profile
            </NavLink>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="border border-red-500 text-red-500 py-2 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
