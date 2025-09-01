import { Link } from "react-router-dom";
import { FRONTEND_CONFIG } from "../config/api";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[#08387F] text-white p-4 shadow-lg fixed left-0 top-0">
      {/* Logo added here */}
      <div className="flex justify-center mb-4">
        <img src="/vignan.png" alt="Logo" className="w-20 h-20" />
      </div>
      
      <h2 className="text-xl font-bold mb-6 text-gray-200 text-center">Admin Panel</h2>
      <nav>
        <ul className="space-y-3">


        <li>
            <Link to="/" className="block p-3 bg-[#0A4CA4] hover:bg-[#062B5B] rounded text-gray-300 hover:text-white text-center font-medium transition-all">
              Create Test
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className="block p-3 bg-[#0A4CA4] hover:bg-[#062B5B] rounded text-gray-300 hover:text-white text-center font-medium transition-all">
              Dashboard
            </Link>
          </li>
        
          {/* <li>
            <Link to="/manage-tests" className="block p-3 bg-[#0A4CA4] hover:bg-[#062B5B] rounded text-gray-300 hover:text-white text-center font-medium transition-all">
              Manage Tests
            </Link>
          </li> */}
          {/* <li>
            <Link to="/update-questions" className="block p-3 bg-[#0A4CA4] hover:bg-[#062B5B] rounded text-gray-300 hover:text-white text-center font-medium transition-all">
              Update Questions
            </Link>
          </li> */}
          <li>
            <Link to={FRONTEND_CONFIG.ROUTES.MY_TESTS} className="block p-3 bg-[#0A4CA4] hover:bg-[#062B5B] rounded text-gray-300 hover:text-white text-center font-medium transition-all">
              Manage Tests
            </Link>
          </li>
          <li>
            {/* <Link to="/quiz" className="block p-3 bg-[#0A4CA4] hover:bg-[#062B5B] rounded text-gray-300 hover:text-white text-center font-medium transition-all">
              Quiz Page
            </Link> */}
          </li>
        </ul>
      </nav>
    </div>
  );
}
