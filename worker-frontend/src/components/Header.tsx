import { Link, NavLink } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [cookie, setCookie] = useCookies(["worker_access_token"]);
  const navigate = useNavigate();

  const logout = () => {
    setCookie("worker_access_token", "");
    window.localStorage.removeItem("workerId");
    navigate("/auth");
  };
  
  return (
    <header className="bg-gray-900">
      <nav className="container mx-auto flex justify-between items-center py-4">
        <div>
          <Link to="/">
            <img
              className="h-16"
              src="https://w7.pngwing.com/pngs/301/302/png-transparent-japan-torii-idea-sticker-t-shirt-japan-logo-sticker-art.png"
              alt="Work For Money"
            />
          </Link>
        </div>
        <ul className="flex gap-4 text-white">
          <li>
            <NavLink
              to="/worker/home"
              className="font-bold"
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/worker/next-task"
              className="font-bold"
            >
               Get Tasks
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/worker/balance"
              className="font-bold"
            >
               Balance
            </NavLink>
          </li>
        </ul>
        <div>
          <ul className="text-white">
            <li>
              {!cookie.worker_access_token ? (
                <NavLink
                  to="/auth"
                  className="font-bold"
                >
                  Connect Your Wallet
                </NavLink>
              ) : (
                <button
                  onClick={logout}
                  className="font-bold"
                >
                  Logout
                </button>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
