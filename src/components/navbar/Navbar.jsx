import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, UserCircle, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchHRProfile } from '../../redux/slice/profile/profileSlice';

const Navbar = ({ onMenuClick = () => {} }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: hrProfile } = useSelector((state) => state.profile || {});

  const [profilePic, setProfilePic] = useState(() => {
    try {
      const stored = localStorage.getItem("userProfile");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.profilePic || parsed.image?.url || "";
      }
    } catch (e) {
      console.error("Failed to parse userProfile in Navbar initial load", e);
    }
    return "";
  });

  const [hasUnread, setHasUnread] = useState(() => {
    try {
      const stored = localStorage.getItem("userNotifications");
      if (stored) {
        const notifs = JSON.parse(stored);
        return notifs.some((n) => !n.isRead);
      }
    } catch (e) {
      console.error("Failed to parse userNotifications in Navbar initial load", e);
    }
    return true; // initialNotifications has unread ones
  });

  // Fetch HR Profile on mount if token exists and profile not yet loaded
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !hrProfile) {
      dispatch(fetchHRProfile());
    }
  }, [dispatch, hrProfile]);

  // Update profilePic when Redux profile updates
  useEffect(() => {
    if (hrProfile) {
      const pic =
        hrProfile.image?.url ||
        (typeof hrProfile.image === "string" ? hrProfile.image : "") ||
        hrProfile.profilePic ||
        "";
      setProfilePic(pic);
    }
  }, [hrProfile]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const stored = localStorage.getItem("userProfile");
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfilePic(parsed.profilePic || parsed.image?.url || "");
        }
      } catch (e) {
        console.error("Failed to parse userProfile in Navbar listener", e);
      }
    };

    const handleNotificationsUpdate = () => {
      try {
        const stored = localStorage.getItem("userNotifications");
        if (stored) {
          const notifs = JSON.parse(stored);
          setHasUnread(notifs.some((n) => !n.isRead));
        }
      } catch (e) {
        console.error("Failed to parse userNotifications in Navbar listener", e);
      }
    };

    window.addEventListener("profileUpdate", handleProfileUpdate);
    window.addEventListener("notificationsUpdate", handleNotificationsUpdate);

    return () => {
      window.removeEventListener("profileUpdate", handleProfileUpdate);
      window.removeEventListener("notificationsUpdate", handleNotificationsUpdate);
    };
  }, []);

  return (
    <header className="w-full bg-white h-16 sm:h-18 px-3 sm:px-5 flex items-center justify-between border-b border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:text-[#9333EA] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-[#9233eacc] font-bold text-base sm:text-lg md:text-xl truncate">
          Outsource Management Panel
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">

        
        {/* Notification Bell with Dot */}
        <div
        onClick={()=> navigate("/notification")}
         className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors">
          <Bell className="text-[#9333EA] w-7 h-7" strokeWidth={1.5} />
          {hasUnread && (
            <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
          )}
        </div>

        {/* User Profile Icon */}
        <div
        onClick={()=> navigate("/profile")} 
        className="cursor-pointer hover:bg-gray-50 p-1 rounded-full transition-colors">
          {profilePic ? (
            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={profilePic}
                alt="User Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='112' viewBox='0 0 112 112'%3E%3Ccircle cx='56' cy='56' r='56' fill='%23d1d5db'/%3E%3Ccircle cx='56' cy='44' r='20' fill='%239ca3af'/%3E%3Cellipse cx='56' cy='95' rx='32' ry='22' fill='%239ca3af'/%3E%3C/svg%3E";
                }}
              />
            </div>
          ) : (
            <UserCircle className="text-[#9333EA] w-9 h-9" strokeWidth={1.5} />
          )}
        </div>
        
      </div>
    </header>
  );
};

export default Navbar;