import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import { useAuctionApi } from "../utils/api.js";
import { formatCurrency, formatDate } from "../utils/helpers.js";
import { useAuth } from "../context/AuthContext.jsx";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5002";

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuctionById, placeBid } = useAuctionApi();
  const { isAuthenticated, user } = useAuth();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);
  const [bidModalOpen, setBidModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { amount: "" } });

  const loadAuction = async () => {
    try {
      setLoading(true);
      const data = await getAuctionById(id);
      setAuction(data);
    } catch (error) {
      console.error("Failed to load auction", error);
      toast.error("Unable to load auction");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const resolvedImage = useMemo(() => {
    if (!auction?.imageUrl) return "/placeholder-gem.svg";
    if (auction.imageUrl.startsWith("http")) return auction.imageUrl;
    return `${API_ORIGIN}${auction.imageUrl}`;
  }, [auction?.imageUrl]);

  const minimumBid = useMemo(() => {
    if (!auction) return 0;
    const baseline = auction.currentHighestBid || auction.startingPrice || 0;
    return Number(baseline) + 1;
  }, [auction]);

  const { canBid, statusLabel, statusColor, hasClosed } = useMemo(() => {
    if (!auction)
      return {
        canBid: false,
        statusLabel: "Scheduled",
        statusColor: "text-gray-500",
        hasClosed: false,
      };

    const now = new Date();
    const startsAt = auction.bidStartTime ? new Date(auction.bidStartTime) : null;
    const endsAt = auction.bidEndTime ? new Date(auction.bidEndTime) : null;

    const hasStarted = startsAt ? now >= startsAt : true;
    const hasEnded = endsAt ? now > endsAt : false;

    const active = Boolean(auction.isBiddingOpen) && hasStarted && !hasEnded;

    let label = "Scheduled";
    let color = "text-gray-500";

    if (hasEnded) {
      label = "Closed";
      color = "text-gray-500";
    } else if (!hasStarted) {
      label = "Scheduled";
      color = "text-amber-500";
    } else if (active) {
      label = "Live";
      color = "text-emerald-700";
    } else {
      label = "Unavailable";
      color = "text-gray-500";
    }

    return { canBid: active, statusLabel: label, statusColor: color, hasClosed: hasEnded };
  }, [auction]);

  const winningBid = useMemo(() => {
    if (!auction) return null;

    if (auction.winningBid) return auction.winningBid;

    if (!auction.bids?.length) return null;

    return auction.bids.reduce((current, candidate) => {
      if (!current) return candidate;
      return Number(candidate.amount) > Number(current.amount) ? candidate : current;
    }, null);
  }, [auction]);

  const isWinningBidder = useMemo(() => {
    if (!user?.email || !winningBid?.user?.email) return false;
    return winningBid.user.email.toLowerCase() === user.email.toLowerCase();
  }, [user?.email, winningBid?.user?.email]);

  const canCheckout = Boolean(hasClosed && winningBid && isWinningBidder);

  const onSubmit = handleSubmit(async (data) => {
    if (!auction) return;

    if (!isAuthenticated) {
      toast.error("Please log in to place a bid.");
      navigate("/login", { state: { from: `/auctions/${id}` } });
      return;
    }

    if (!canBid) {
      toast.error("Bidding is closed for this auction.");
      return;
    }

    try {
      setPlacingBid(true);
      await placeBid(auction.id, { amount: Number(data.amount) });
      toast.success("Bid placed successfully");
      reset();
      setBidModalOpen(false);
      await loadAuction();
    } catch (error) {
      console.error("Bid failed", error);
      toast.error(error?.response?.data?.message || "Unable to place bid");
    } finally {
      setPlacingBid(false);
    }
  });

  if (loading) {
    return (
      <div className="container-lux py-20">
        <Loader />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container-lux space-y-6 py-20 text-center">
        <Toaster position="top-right" />
        <p className="text-lg text-gray-600">This auction could not be found.</p>
        <Button onClick={() => navigate("/auctions")}>Back to auctions</Button>
      </div>
    );
  }

  const handleOpenBidModal = () => {
    if (!canBid) return;
    setBidModalOpen(true);
  };

  return (
    <div className="container-lux space-y-10 py-16">
      <Toaster position="top-right" />

      <nav className="text-sm text-gray-500">
        <Link to="/auctions" className="hover:text-emerald-600">
          Auctions
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{auction.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl shadow-lg">
            <img
              src={resolvedImage}
              alt={auction.name}
              className="h-full w-full object-cover"
            />
          </div>

          <section className="card-lux space-y-4 p-8">
            <h2 className="font-playfair text-2xl text-gray-900">About this gemstone</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              {auction.description || "No description provided."}
            </p>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-400">
                  Bidding opens
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {auction.bidStartTime ? formatDate(auction.bidStartTime) : "TBA"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-400">
                  Bidding closes
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {auction.bidEndTime ? formatDate(auction.bidEndTime) : "TBA"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="card-lux space-y-6 p-8">
            <header>
              <h3 className="font-playfair text-xl text-gray-900">Bid history</h3>
              <p className="text-sm text-gray-500">
                {auction.bids?.length || 0} bid{auction.bids?.length === 1 ? "" : "s"} placed
              </p>
            </header>

            <div className="space-y-4">
              {auction.bids?.length ? (
                auction.bids.map((bid) => (
                  <div
                    key={bid.id}
                    className="flex items-center justify-between rounded-2xl border border-emerald-50 bg-white px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(bid.amount)}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(bid.bidTime)}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                      {bid.user?.email || "Anonymous"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No bids yet.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card-lux space-y-6 p-8">
            <div className="space-y-2">
              <h1 className="font-playfair text-3xl text-gray-900">{auction.name}</h1>
              <p className="text-sm text-gray-500">Lot #{auction.id}</p>
            </div>

            <dl className="space-y-4 text-sm text-gray-600">
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-400">
                  Starting price
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {formatCurrency(auction.startingPrice)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-400">
                  Current highest bid
                </dt>
                <dd className="text-lg font-semibold text-emerald-700">
                  {formatCurrency(auction.currentHighestBid || auction.startingPrice)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-400">
                  Status
                </dt>
                <dd className={clsx("font-semibold", statusColor)}>
                  {statusLabel}
                </dd>
              </div>
            </dl>

            <div className="space-y-4">
              {canBid ? (
                <Button onClick={handleOpenBidModal}>Place a bid</Button>
              ) : (
                <Button disabled variant="secondary">
                  {statusLabel === "Closed" ? "Bidding closed" : "Bidding unavailable"}
                </Button>
              )}
              {canCheckout ? (
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/checkout?auctionId=${auction.id}`)}
                >
                  Proceed to checkout
                </Button>
              ) : (
                <p className="text-xs text-gray-500">
                  Checkout is available to the winning bidder once the auction closes.
                </p>
              )}
            </div>
          </section>

          <section className="card-lux space-y-4 p-8">
            <h3 className="font-playfair text-xl text-gray-900">Need assistance?</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              Our concierge team can help with provenance reports, private viewings,
              and arranging secure shipping once the lot is settled.
            </p>
            <Button variant="secondary" onClick={() => navigate("/help")}>Contact support</Button>
          </section>
        </aside>
      </div>

      <Modal
        open={bidModalOpen}
        onClose={() => setBidModalOpen(false)}
        title={`Place a bid on ${auction.name}`}
        description={`The current highest bid is ${formatCurrency(
          auction.currentHighestBid || auction.startingPrice
        )}. Bidding closes on ${auction.bidEndTime ? formatDate(auction.bidEndTime) : "TBA"}.`}
      >
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Bid amount</label>
            <Controller
              name="amount"
              control={control}
              rules={{ required: true, min: minimumBid }}
              render={({ field }) => (
                <input
                  type="number"
                  step="0.01"
                  min={minimumBid}
                  className="w-full rounded-full border border-emerald-100 bg-white px-5 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder={`Minimum bid ${formatCurrency(minimumBid)}`}
                  {...field}
                />
              )}
            />
            <p className="text-xs text-gray-500">Minimum bid: {formatCurrency(minimumBid)}</p>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setBidModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || placingBid}>
              {isSubmitting || placingBid ? "Submitting..." : "Submit bid"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AuctionDetail;
