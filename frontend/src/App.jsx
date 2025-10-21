import { Navigate, Route, Routes } from "react-router-dom";
import toast from "react-hot-toast";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Auctions from "./pages/Auctions.jsx";
import About from "./pages/About.jsx";
import Help from "./pages/Help.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AddAuction from "./pages/AddAuction.jsx";
import Profile from "./pages/Profile.jsx";
import AuctionDetail from "./pages/AuctionDetail.jsx";
import Checkout from "./pages/Checkout.jsx";
import Payment from "./pages/Payment.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const Layout = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-background">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

//  Smarter protected route with smoother redirect handling
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div className="text-center p-10">Loading...</div>;

  if (!isAuthenticated) {
    // Preserve where user wanted to go
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  // Default to "User" role if backend doesn’t attach role claim
  const userRole = user?.role || "User";

  if (roles && !roles.includes(userRole)) {
    toast?.error?.("You don’t have permission to view this page.");
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/auctions/:id" element={<AuctionDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/auctions/new"
          element={
            <ProtectedRoute roles={["Admin", "Auctioneer", "User"]}>
              <AddAuction />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
