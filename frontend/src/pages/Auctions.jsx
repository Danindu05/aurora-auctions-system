import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

import Card from "../components/Card.jsx";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import { useAuctionApi } from "../utils/api.js";
import { formatCurrency, formatDate } from "../utils/helpers.js";
import { useAuth } from "../context/AuthContext.jsx";

const Auctions = () => {
  const { getAuctions, placeBid } = useAuctionApi();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const selectedFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("selected");
  }, [location.search]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { amount: "" } });

  // ✅ Load auctions from backend
  useEffect(() => {
    const loadAuctions = async () => {
      setLoading(true);
      try {
        const response = await getAuctions();
        setAuctions(response || []);
        if (selectedFromQuery) {
          const match = response?.find(
            (item) => String(item.id) === selectedFromQuery
          );
          if (match) setSelectedAuction(match);
        }
      } catch (error) {
        console.error("Failed to load auctions", error);
        toast.error("Unable to load auctions");
      } finally {
        setLoading(false);
      }
    };
    loadAuctions();
  }, [getAuctions, refresh, selectedFromQuery]);

  // ✅ Place bid
  const onSubmit = handleSubmit(async (data) => {
    if (!selectedAuction) return;
    try {
      await placeBid(selectedAuction.id, { amount: Number(data.amount) });
      toast.success("Bid placed successfully");
      reset();
      setSelectedAuction(null);
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Bid failed", error);
      toast.error(error?.response?.data?.message || "Unable to place bid");
    }
  });

  const renderGrid = () => {
    if (loading) return <Loader />;

    if (auctions.length === 0) {
      return (
        <div className="rounded-3xl border border-emerald-50 bg-surface p-10 text-center text-gray-500">
          No auctions available right now. Please check back soon.
        </div>
      );
    }

    return (
      <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
        {auctions.map((auction) => (
          <Card
            key={auction.id}
            auction={auction}
            onBid={(item) => {
              if (!isAuthenticated) {
                navigate("/login");
                return;
              }
              setSelectedAuction(item);
            }}
            onView={(auctionId) => navigate(`/auctions/${auctionId}`)}
          />
        ))}
      </div>
    );
  };

  // ✅ Handle numeric safety for minimum bid
  const minimumBid = selectedAuction
    ? Number(
        selectedAuction?.currentHighestBid ??
          selectedAuction?.startingPrice ??
          0
      ) + 1
    : 0;

  return (
    <div className="container-lux space-y-12 py-16">
      <Toaster position="top-right" />

      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <h1 className="heading-lux">Aurora Gem Auctions</h1>
          <p className="subheading-lux max-w-2xl">
            Browse our current catalog of rare gemstones. Each lot is vetted by
            experts and includes authenticated provenance.
          </p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => navigate("/auctions/new")}>
            Add Auction
          </Button>
        )}
      </header>

      {renderGrid()}

      {/* ✅ Bid modal */}
      <Modal
        open={Boolean(selectedAuction)}
        onClose={() => setSelectedAuction(null)}
        title={`Place a bid on ${selectedAuction?.name ?? "Gem"}`}
        description={
          selectedAuction &&
          `Bidding closes on ${
            selectedAuction?.bidEndTime
              ? formatDate(selectedAuction.bidEndTime)
              : "TBA"
          }. The current highest bid is ${formatCurrency(
            selectedAuction?.currentHighestBid ||
              selectedAuction?.startingPrice
          )}.`
        }
      >
        {selectedAuction && (
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Bid amount
              </label>
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
                    placeholder="Enter your bid"
                    {...field}
                  />
                )}
              />
              <p className="text-xs text-gray-500">
                Minimum bid: {formatCurrency(minimumBid)}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedAuction(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Bid"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Auctions;
