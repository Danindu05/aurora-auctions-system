import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../utils/helpers.js";

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="container-lux space-y-10 py-16">
      <header className="space-y-2">
        <h1 className="heading-lux">Welcome, {user.name}</h1>
        <p className="subheading-lux">Manage your profile and review your auction activity.</p>
      </header>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="card-lux space-y-4 p-8">
          <h2 className="font-playfair text-2xl text-gray-900">Account Details</h2>
          <dl className="space-y-3 text-sm text-gray-500">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">Name</dt>
              <dd className="text-base text-gray-900">{user.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">Email</dt>
              <dd className="text-base text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">Role</dt>
              <dd className="text-base text-gray-900">{user.role}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">Member since</dt>
              <dd className="text-base text-gray-900">{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
        </div>
        <div className="card-lux flex flex-col justify-between space-y-4 p-8">
          <div>
            <h2 className="font-playfair text-2xl text-gray-900">Need assistance?</h2>
            <p className="text-sm text-gray-500">
              Our concierge team is ready to help with bidding limits, consignment inquiries, or private previews.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate("/help")}>Visit help center</Button>
            <Button variant="link" className="text-red-500" onClick={logout}>Sign out</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
