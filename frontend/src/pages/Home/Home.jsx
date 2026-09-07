import React from "react";
import Navbar from "../../components/navbar/Navbar";
import { useSelector } from "react-redux";
import { User, Mail, Activity } from "lucide-react";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function Home() {
  useDocumentTitle("Home")
  const userData = useSelector((state) => state.auth);
  const user = userData.user;
  console.log("home page user is : " , user.name);
  

  return (
    <>
      <Navbar name={user?.name || "User"} imageUrl={user?.profileImage} />

      <div className="min-h-screen bg-gradient-to-tr from-teal-400 to-blue-500 py-16 px-4 flex justify-center items-start font-[Poppins]">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {user?.name || "User"}!
          </h1>
          <p className="text-gray-500 mb-8 text-lg">
            Here’s your profile overview and recent activity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-cyan-100 to-blue-100 shadow-inner rounded-xl p-6 flex items-center space-x-6 transition-all duration-300">
              <img
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                src={user?.profileImage}
                alt="Profile"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  {user?.name}
                </h2>
                <p className="text-gray-700 flex items-center gap-2 mt-1">
                  <Mail className="w-5 h-5 text-blue-500" />
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Quick Stats or Feature Box Placeholder */}
            <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Account Info
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>Account created: <span className="font-medium">Just now</span></li>
                <li>Role: <span className="font-medium">User</span></li>
                <li>Status: <span className="text-green-600 font-medium">Active</span></li>
              </ul>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Activity
            </h3>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow text-gray-600">
              <p className="text-sm">You haven’t done anything yet. Start exploring!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
