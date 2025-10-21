import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, User, LogOut, Shield, PlusCircle } from "lucide-react";

import Button from "./Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/auctions", label: "Auctions" },
  { to: "/about", label: "About" },
  { to: "/help", label: "Help" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-50 bg-white/90 backdrop-blur">
      <nav className="container-lux flex items-center justify-between py-5">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white-600 text-white shadow-lux">
           <img
          src="/logo.png"            // public assets are referenced from root
          alt="Logo"
          className="h-8 w-auto object-contain"
        />
          </div>
          <div className="text-left">
           
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Aurora Gems</p>
          </div>
        </Link>

        <div className="hidden items-center space-x-10 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-emerald-700" : "text-gray-500 hover:text-emerald-600"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center space-x-3 lg:flex">
          {isAuthenticated ? (
            <>
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() => navigate(user?.role === "Admin" ? "/admin" : "/profile")}
              >
                <User className="h-4 w-4" />
                Profile
              </Button>
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() => navigate("/auctions/new")}
              >
                <PlusCircle className="h-4 w-4" />
                Add Auction
              </Button>
              {user?.role === "Admin" && (
                <Button variant="secondary" className="gap-2" onClick={() => navigate("/admin")}> 
                  <Shield className="h-4 w-4" />
                  Dashboard
                </Button>
              )}
              <Button variant="link" className="gap-2 text-gray-500" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => navigate("/login")}>Login</Button>
              <Button onClick={() => navigate("/register")}>Create account</Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-full border border-emerald-100 p-2 text-gray-500 transition hover:text-emerald-700 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </nav>

      {open && (
        <div className="border-t border-emerald-50 bg-white lg:hidden">
          <div className="container-lux space-y-4 py-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block text-base font-medium ${isActive ? "text-emerald-700" : "text-gray-500"}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={() => {
                    setOpen(false);
                    navigate(user?.role === "Admin" ? "/admin" : "/profile");
                  }}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={() => {
                    setOpen(false);
                    navigate("/auctions/new");
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Auction
                </Button>
                {user?.role === "Admin" && (
                  <Button
                    variant="secondary"
                    className="w-full gap-2"
                    onClick={() => {
                      setOpen(false);
                      navigate("/admin");
                    }}
                  >
                    <Shield className="h-4 w-4" />
                    Dashboard
                  </Button>
                )}
                <Button
                  variant="link"
                  className="w-full justify-start gap-2 text-gray-500"
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    navigate("/login");
                  }}
                >
                  Login
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    navigate("/register");
                  }}
                >
                  Create account
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
