import { useEffect, useState } from "react";
import { ChevronRight, Crown, Gem, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";
import Card from "../components/Card.jsx";
import Modal from "../components/Modal.jsx";
import { useApi } from "../context/ApiContext.jsx";
import { formatCurrency } from "../utils/helpers.js";
import { useAuth } from "../context/AuthContext.jsx";

const Home = () => {
  const { client } = useApi();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // ✅ Your backend only has /api/AuctionItems — no /auction or /featured
        const response = await client.get("/AuctionItems");
        setAuctions(response.data || []);
      } catch (error) {
        console.error("Failed to load auctions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [client]);

  return (
    <div className="space-y-24 pb-24">
      <section className="relative overflow-hidden bg-hero-pattern">
        <div className="container-lux grid gap-16 py-24 md:grid-cols-2 md:items-center">
          <div className="space-y-8">
            <p className="inline-flex items-center rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
              Luxury Gem Auctions
            </p>
            <h1 className="font-playfair text-5xl text-gray-900">Bid. Shine. Own.</h1>
            <p className="max-w-lg text-base text-gray-500">
              Discover Aurora Auctions — a curated destination for museum-grade gemstones. From emerald cascades to sapphire constellations, each lot is authenticated and ready for your collection.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate("/auctions")}>View Auctions</Button>
              <Button
                variant="secondary"
                onClick={() =>
                  navigate(isAuthenticated ? "/auctions/new" : "/register")
                }
              >
                Start Bidding
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-emerald-600" />
                Trusted curators
              </span>
              <span className="flex items-center gap-2">
                <Gem className="h-4 w-4 text-emerald-600" />
                Certified gems
              </span>
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                White-glove logistics
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="card-lux relative overflow-hidden">
              <img
                src="/hero.png"
                alt="Luxury Gem"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/70 to-transparent p-6">
                <p className="font-playfair text-2xl text-gray-900">
                  Aurora Star Sapphire
                </p>
                <p className="text-sm text-gray-600">
                  Last sold for {formatCurrency(24800)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-lux space-y-12">
        <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="heading-lux">Current Lots</h2>
            <p className="subheading-lux">
              Hand-selected gemstones currently commanding the spotlight.
            </p>
          </div>
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => navigate("/auctions")}
          >
            Explore Auctions <ChevronRight className="h-4 w-4" />
          </Button>
        </header>
        {loading ? (
          <Loader />
        ) : auctions.length === 0 ? (
          <p className="rounded-3xl border border-emerald-50 bg-surface px-6 py-10 text-center text-sm text-gray-500">
            Auctions will appear here soon.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {auctions.map((auction) => (
              <Card
                key={auction.id}
                auction={auction}
                onBid={setSelectedAuction}
              />
            ))}
          </div>
        )}
      </section>

      <Modal
        open={Boolean(selectedAuction)}
        onClose={() => setSelectedAuction(null)}
        title={`Bid on ${selectedAuction?.name ?? ""}`}
        description="Confirm your bid amount and elevate your collection."
      >
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            Current highest bid:{" "}
            <span className="font-semibold text-emerald-700">
              {formatCurrency(
                selectedAuction?.currentHighestBid ||
                  selectedAuction?.startingPrice
              )}
            </span>
          </p>
          <Button
            onClick={() =>
              navigate(`/auctions?selected=${selectedAuction?.id}`)
            }
          >
            Continue to bidding
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
