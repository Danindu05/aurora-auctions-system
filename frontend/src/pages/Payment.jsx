import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import md5 from "crypto-js/md5";
import Loader from "../components/Loader.jsx";
import Button from "../components/Button.jsx";
import toast, { Toaster } from "react-hot-toast";

const PAYHERE_URL = "https://sandbox.payhere.lk/pay/checkout";
const MERCHANT_ID = "1232547";
const MERCHANT_SECRET = "MTkzMzg5MDM3NTE4Nzg2NTg4OTA5MDQ0NjQ5MDczNDc1ODQ0MDEx";
const CURRENCY = "LKR";

const RETURN_URL = "http://localhost:5173/payment/success";
const CANCEL_URL = "http://localhost:5173/payment/cancel";
const NOTIFY_URL = "https://localhost:5173/payment/notify";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);

  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  const auctionId = searchParams.get("auctionId");
  const totalAmount = searchParams.get("total");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      toast.error("Please log in to make a payment.");
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [authLoading, isAuthenticated, navigate, location]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user || !auctionId || !totalAmount) {
      return;
    }

    try {
      const orderId = auctionId;
      const amount = totalAmount;

      const hashedSecret = md5(MERCHANT_SECRET).toString().toUpperCase();
      const amountFormatted = parseFloat(amount)
        .toLocaleString("en-us", { minimumFractionDigits: 2 })
        .replaceAll(",", "");
      const hash = md5(
        MERCHANT_ID + orderId + amountFormatted + CURRENCY + hashedSecret
      ).toString().toUpperCase();

      setPaymentData({
        merchant_id: MERCHANT_ID,
        return_url: RETURN_URL,
        cancel_url: CANCEL_URL,
        notify_url: NOTIFY_URL,
        first_name: user.firstName || "Saman",
        last_name: user.lastName || "Perera",
        email: user.email,
        phone: user.phone || "0771234567",
        address: user.address || "No.1, Galle Road",
        city: user.city || "Colombo",
        country: user.country || "Sri Lanka",
        order_id: orderId,
        items: `Auction Lot #${orderId}`,
        currency: CURRENCY,
        amount: amountFormatted,
        hash: hash,
      });
    } catch (err) {
      console.error("Failed to generate payment hash:", err);
      setError("An error occurred while preparing your payment. Please try again.");
      toast.error("Failed to prepare payment.");
    }
  }, [authLoading, isAuthenticated, user, auctionId, totalAmount]);

  useEffect(() => {
    if (paymentData && formRef.current) {
      setTimeout(() => {
        formRef.current.submit();
      }, 1500);
    }
  }, [paymentData]);

  if (error) {
    return (
      <div className="container-lux space-y-6 py-20 text-center">
        <Toaster position="top-right" />
        <h1 className="heading-lux text-red-600">Payment Error</h1>
        <p className="subheading-lux">{error}</p>
        <Button
          onClick={() => navigate(`/checkout?auctionId=${auctionId}`)}
          variant="secondary"
        >
          Back to Checkout
        </Button>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="container-lux space-y-4 py-20 text-center">
        <Loader />
        <p className="text-lg text-gray-600">Preparing secure payment...</p>
      </div>
    );
  }

  return (
    <div className="container-lux space-y-10 py-16">
      <Toaster position="top-right" />
      <header className="space-y-2 text-center">
        <h1 className="heading-lux">Redirecting to Payment</h1>
        <p className="subheading-lux">
          You are being redirected to the secure PayHere gateway to complete your
          purchase.
        </p>
        <div className="pt-4">
          <Loader />
        </div>
      </header>

      <form
        ref={formRef}
        method="post"
        action={PAYHERE_URL}
        style={{ display: "none" }}
      >
        <input type="hidden" name="merchant_id" value={paymentData.merchant_id} />
        <input type="hidden" name="return_url" value={paymentData.return_url} />
        <input type="hidden" name="cancel_url" value={paymentData.cancel_url} />
        <input type="hidden" name="notify_url" value={paymentData.notify_url} />
        <input type="hidden" name="first_name" value={paymentData.first_name} />
        <input type="hidden" name="last_name" value={paymentData.last_name} />
        <input type="hidden" name="email" value={paymentData.email} />
        <input type="hidden" name="phone" value={paymentData.phone} />
        <input type="hidden" name="address" value={paymentData.address} />
        <input type="hidden" name="city" value={paymentData.city} />
        <input type="hidden" name="country" value={paymentData.country} />
        <input type="hidden" name="order_id" value={paymentData.order_id} />
        <input type="hidden" name="items" value={paymentData.items} />
        <input type="hidden" name="currency" value={paymentData.currency} />
        <input type="hidden" name="amount" value={paymentData.amount} />
        <input type="hidden" name="hash" value={paymentData.hash} />
        <input type="submit" value="Buy Now" />
      </form>
    </div>
  );
};

export default Payment;
