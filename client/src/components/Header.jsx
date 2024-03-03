import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Header() {
  const { currentUser } = useSelector((state) => state.user); // Ensure the slice name is correct

  return (
    <header className="bg-blue-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:max-xl flex flex-wrap">
            <span className="text-blue-600">Neel</span>
            <span className="text-blue-950">State</span>
          </h1>
        </Link>
        <form className="bg-blue-50 p-3 rounded-lg flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-24 sm:w-64"
          />
          <FaSearch className="text-slate-600" />
        </form>
        <ul className="flex gap-4">
          <li>
            <Link to="/" className="text-slate-700 hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="text-slate-700 hover:underline">
              About
            </Link>
          </li>
          <li>
            <Link to="/sign-in" className="text-slate-700 hover:underline">
              {currentUser ? (
                <img className="rounded-full h-10 w-10 object-cover" src={currentUser.avatar} alt="Profile" />
              ) : (
                "Sign in"
              )}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Header;
