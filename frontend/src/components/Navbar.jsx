import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FiCalendar, FiChevronDown, FiLogOut, FiTag, FiUser } from "react-icons/fi";
import MobileMenu from "./MobileMenu";
import { getToken, getTokenPayload, isTokenExpired } from "../services/auth";

const API = import.meta.env.VITE_API_URL || "";

const Navbar = () => {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const profileMenuRef = useRef(null);

  const token = getToken();
  const payload = getTokenPayload(token);
  const isLoggedIn = Boolean(token && !isTokenExpired(token));
  const isAdmin = payload?.role === "admin" && isLoggedIn;

  useEffect(() => {
    if (!isLoggedIn || !token) {
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
  }, [isLoggedIn, token, payload?.role, payload?.email]);

  const profileName = profile?.name || profile?.email || payload?.email || "Profile";
  const profileRole = profile?.role || payload?.role || "member";
  const profileInitials = String(profileName).trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "P";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 80) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClass = ({ isActive }) =>
    isActive ? "text-orange-500" : "hover:text-orange-400";

  const logout = () => {
    localStorage.removeItem("token");
    setProfileOpen(false);
    window.location.href = "/login";
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md px-10 py-4 flex justify-between items-center transition-transform duration-300 ${
          show ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <h1 className="text-xl font-bold text-orange-500">EVENTIFY</h1>

        <ul className="hidden md:flex items-center gap-8 text-sm">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          <NavLink to="/events" className={linkClass}>
            Events
          </NavLink>

          {!isAdmin && (
            <>
              <NavLink to="/contact" className={linkClass}>
                Contact
              </NavLink>

              <NavLink to="/sell-ticket" className={linkClass}>
                Sell Your Tickets
              </NavLink>
            </>
          )}

          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin Dashboard
            </NavLink>
          )}

          {!isLoggedIn ? (
            <>
              <NavLink
                to="/login"
                className="border border-orange-500 text-orange-500 px-4 py-1 rounded"
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className="bg-orange-500 text-black px-4 py-1 rounded"
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <li className="relative list-none" ref={profileMenuRef}>
              <button
                className="profile-menu-trigger"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
              >
                <span className="profile-menu-avatar">{profileInitials}</span>
                <span className="profile-menu-name">{profileName}</span>
                <FiChevronDown className="profile-menu-icon" />
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <span className="profile-dropdown-avatar">{profileInitials}</span>
                    <div>
                      <span className="profile-dropdown-name">{profileName}</span>
                      <span className="profile-dropdown-role">{profileRole}</span>
                    </div>
                  </div>

                  <div className="profile-dropdown-links">
                    <NavLink to="/profile" className="profile-dropdown-link" onClick={() => setProfileOpen(false)}>
                      <FiUser /> My Profile
                    </NavLink>
                    <NavLink to="/profile/bookings" className="profile-dropdown-link" onClick={() => setProfileOpen(false)}>
                      <FiCalendar /> My Bookings
                    </NavLink>
                    <NavLink to="/profile/tickets" className="profile-dropdown-link" onClick={() => setProfileOpen(false)}>
                      <FiTag /> My Tickets
                    </NavLink>
                    <button className="profile-dropdown-logout" onClick={logout}>
                      <FiLogOut /> Logout
                    </button>
                  </div>
                </div>
              )}
            </li>
          )}
        </ul>

        <button
          onClick={() => setMenuOpen(true)}
          className="text-2xl md:hidden"
        >
          ☰
        </button>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default Navbar;
