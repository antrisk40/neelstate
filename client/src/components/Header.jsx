import { FaSearch } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

function Header() {
  const { currentUser } = useSelector((state) => state.user); // Ensure the slice name is correct
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  // Sync state with URL manually (e.g. if arriving from a link)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    } else {
      setSearchTerm("");
    }
  }, [location.search]);

  // Debouncing logic
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentUrlTerm = urlParams.get("searchTerm") || "";

    // Only fire the debounced navigation if the value actually differs from the URL
    if (searchTerm !== currentUrlTerm) {
      const delayDebounceFn = setTimeout(() => {
        if (searchTerm) {
          urlParams.set("searchTerm", searchTerm);
        } else {
          urlParams.delete("searchTerm"); // Remove empty search string
        }
        navigate(`/search?${urlParams.toString()}`);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, navigate]);

  return (
    <header className="bg-blue-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:max-xl flex flex-wrap">
            <span className="text-blue-600">Neel</span>
            <span className="text-blue-950">State</span>
          </h1>
        </Link>
        <form onSubmit={handleSubmit} className="bg-blue-50 p-3 rounded-lg flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-24 sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">
            <FaSearch className="text-slate-600" />
          </button>
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
          {currentUser && (
            <>
              <li>
                <Link to="/profile" className="text-slate-700 hover:underline">
                  Profile
                </Link>
              </li>
            </>
          )}
          <li>
            <Link to="/sign-in" className="text-slate-700 hover:underline">
              {currentUser ? (
                <img
                  className="rounded-full h-10 w-10 object-cover"
                  src={currentUser.avatar}
                  alt="Profile"
                />
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
