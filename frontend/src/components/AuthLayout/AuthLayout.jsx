import ums from "../../assets/ums.jpg";

export default function AuthLayout({ title, children, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-teal-400 to-blue-500 font-[Poppins]">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-700">
        {/* Left Side */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-bl from-cyan-500 to-blue-600 text-white flex-col items-center justify-center p-10 space-y-6">
          <h2 className="text-4xl font-bold text-center">{title}</h2>
          <img
            src={ums}
            alt="Welcome"
            className="w-full max-w-xs rounded-xl shadow-xl"
          />
          <p className="text-lg italic text-center">
            “Your journey begins with a single click.”
          </p>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-center mb-6">{subtitle}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}
