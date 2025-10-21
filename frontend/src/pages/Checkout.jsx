import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";
import { useAuctionApi } from "../utils/api.js";
import { formatCurrency, formatDate } from "../utils/helpers.js";
import { useAuth } from "../context/AuthContext.jsx";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getAuctionById } = useAuctionApi();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const auctionId = searchParams.get("auctionId");

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAuction = async () => {
      if (!auctionId) {
        toast.error("Missing auction reference");
        return;
      }

      try {
        setLoading(true);
        const data = await getAuctionById(auctionId);
        setAuction(data);
      } catch (error) {
        console.error("Failed to load checkout auction", error);
        toast.error("Unable to load auction");
      } finally {
        setLoading(false);
      }
    };

    loadAuction();
  }, [auctionId, getAuctionById]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      toast.error("Please log in to continue to checkout.");
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [authLoading, isAuthenticated, navigate, location]);

  useEffect(() => {
    if (!auction || authLoading) return;

    const highestBid = auction.winningBid
      ? auction.winningBid
      : auction.bids?.reduce((current, candidate) => {
          if (!current) return candidate;
          return Number(candidate.amount) > Number(current.amount) ? candidate : current;
        }, null);

    const hasClosed = auction.bidEndTime
      ? new Date() > new Date(auction.bidEndTime)
      : false;

    const isWinner = Boolean(
      highestBid?.user?.email &&
        user?.email &&
        highestBid.user.email.toLowerCase() === user.email.toLowerCase()
    );

    if (!hasClosed || !isWinner) {
      toast.error("Only the winning bidder can access checkout for this auction.");
      navigate(`/auctions/${auction.id}`);
    }
  }, [auction, authLoading, navigate, user?.email]);

  const pricing = useMemo(() => {
    const hammerPrice = Number(
      auction?.currentHighestBid ?? auction?.startingPrice ?? 0
    );
    const buyerPremium = hammerPrice * 0.12; // 12% premium
    const insurance = hammerPrice * 0.02;
    const shipping = hammerPrice > 0 ? 195 : 0;
    const total = hammerPrice + buyerPremium + insurance + shipping;

    return {
      hammerPrice,
      buyerPremium,
      insurance,
      shipping,
      total,
    };
  }, [auction]);

  if (loading) {
    return (
      <div className="container-lux py-20">
        <Loader />
      </div>
    );
  }

  if (!auctionId) {
    return (
      <div className="container-lux space-y-6 py-20 text-center">
        <Toaster position="top-right" />
        <p className="text-lg text-gray-600">No auction selected for checkout.</p>
        <Button onClick={() => navigate("/auctions")}>Browse auctions</Button>
      </div>
    );
  }

  return (
    <div className="container-lux space-y-10 py-16">
      <Toaster position="top-right" />

      <header className="space-y-2">
        <h1 className="heading-lux">Secure Checkout</h1>
        <p className="subheading-lux">
          Review fees, confirm your shipping preference, and proceed to payment to secure your gem.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card-lux space-y-6 p-10">
          <h2 className="font-playfair text-2xl text-gray-900">Lot summary</h2>

          {auction ? (
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{auction.name}</span>
                <span className="text-xs uppercase tracking-wide text-gray-400">
                  Lot #{auction.id}
                </span>
              </div>
              <p>{auction.description || "No description provided."}</p>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-400">
                    Bidding closed
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {auction.bidEndTime ? formatDate(auction.bidEndTime) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-400">
                    Hammer price
                  </dt>
                  <dd className="text-sm font-semibold text-emerald-700">
                    {formatCurrency(pricing.hammerPrice)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading lot information…</p>
          )}
        </section>

        <aside className="space-y-6">
          <section className="card-lux space-y-5 p-8">
            <h3 className="font-playfair text-xl text-gray-900">Purchase breakdown</h3>
            <dl className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <dt>Hammer price</dt>
                <dd className="font-medium text-gray-900">
                  {formatCurrency(pricing.hammerPrice)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Buyer premium (12%)</dt>
                <dd>{formatCurrency(pricing.buyerPremium)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Insurance</dt>
                <dd>{formatCurrency(pricing.insurance)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Insured shipping</dt>
                <dd>{formatCurrency(pricing.shipping)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-emerald-50 pt-3 text-base font-semibold text-gray-900">
                <dt>Total due</dt>
                <dd>{formatCurrency(pricing.total)}</dd>
              </div>
            </dl>

            <Button
              onClick={() =>
                navigate(`/payment?auctionId=${auctionId}&total=${pricing.total.toFixed(2)}`)
              }
            >
              Continue to payment
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/auctions/${auctionId}`)}>
              Review lot details
            </Button>
          </section>

          <section className="card-lux space-y-4 p-8">
            <h4 className="font-playfair text-lg text-gray-900">Trusted logistics</h4>
            <p className="text-sm leading-relaxed text-gray-600">
              Each shipment is insured end-to-end with discreet, white-glove delivery partners.
              A concierge will coordinate timing once payment is confirmed.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
