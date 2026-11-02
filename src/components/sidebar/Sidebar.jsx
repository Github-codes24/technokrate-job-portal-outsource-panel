import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/slice/auth/loginSlice'
import {
  LayoutGrid,
  Settings,
  Briefcase,
  LogOut,
  UserCircle,
  TrendingUp,
  User,
} from 'lucide-react'
import logo from '../../assets/technologo.svg'
import ConfirmModal from "../common/ConfirmModal";
import bottomicon from '../../assets/favicon.svg'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/' },
  { id: 'candidate-db', label: 'Candidate Database', icon: User, path: '/candidate-database' },
  { id: 'vacancies', label: 'Current Vacancies', icon: Briefcase, path: '/vacancies' },
  { id: 'activity', label: 'Daily Activity', icon: TrendingUp, path: '/activity' },
  // { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/profile' },
]

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    setShowLogoutModal(false);
    window.location.href = "/get-started";
  };
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-68 h-screen bg-gradient-to-b border-r border-purple-200 from-[#e6c5f1] to-[#8931BA] flex flex-col text-white font-sans shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header / Logo */}
        <div className="bg-white p-4 mb-3 flex justify-between lg:justify-center items-center">
          <NavLink to="/" onClick={onClose}>
            <img src={logo} alt="Outsource Panel" className="h-10 cursor-pointer" />
          </NavLink>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-800 p-1 rounded-md"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>


        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <ul className="space-y-1.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-2.5 transition-all duration-150 rounded-xl ${
                      isActive
                        ? 'bg-white text-[#8931BA] border border-[#8931BA] font-semibold shadow-xs'
                        : 'text-white hover:bg-white/10 font-normal'
                    }`
                  }
                >
                  <item.icon size={20} className="shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Branding & Logout */}
        <div className="p-6 space-y-6">
          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full bg-white text-[#9333EA] py-3 px-8 rounded-xl flex items-center justify-center gap-3 font-medium hover:bg-gray-100 transition-colors shadow-lg"
          >
            <LogOut size={20} />
            Log out
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Yes, Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default Sidebar;