import React, { useState } from "react";
import rosh from "../../assets/rosh.png";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { Menu, LogOut, UserCog } from "lucide-react";

export default function Navbar({ name = "Ajith", imageUrl }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 md:px-12 flex items-center justify-between relative z-50 font-[Poppins] navbar-animate">
      <Link to="/user/home">
        <h1 className="text-indigo-600 hover:text-indigo-400 hover:scale-105 transition-transform duration-300 text-2xl font-semibold">
          User Management System
        </h1>
      </Link>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-8 text-gray-600 text-sm font-medium">
        <Link to="/user/home">
          <li className="hover:text-indigo-600 transition-transform duration-300">
            Home
          </li>
        </Link>
        <li className="hover:text-indigo-600 transition-transform duration-300">
          Services
        </li>
        <li className="hover:text-indigo-600 transition-transform duration-300">
          About
        </li>
        <li className="hover:text-indigo-600 transition-transform duration-300">
          Contact
        </li>
      </ul>

      {/* User Profile & Dropdown */}
      <div className="relative group flex items-center gap-4">
        <span className="hidden md:inline text-gray-700 font-medium">
          {name}
        </span>

        <div className="relative">
          <img
            src={imageUrl || rosh}
            alt="Profile"
            className="w-10 h-10 object-cover rounded-full cursor-pointer border-2 border-indigo-500 hover:scale-105 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          />

          {/* Dropdown menu */}
          <div
            className={`absolute right-0 mt-3 w-40 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden transition-all duration-300 origin-top-right ${
              menuOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
            }`}
          >
            <Link
              to="/user/edit-profile"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <UserCog className="w-4 h-4" /> Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden text-gray-700"
        onClick={() => alert("You can add a drawer or dropdown for mobile navigation here.")}
      >
        <Menu className="w-6 h-6" />
      </button>
    </nav>
  );
}
