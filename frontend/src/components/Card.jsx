import { useMemo } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import Button from "./Button.jsx";

dayjs.extend(duration);

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5002";

const Card = ({ auction, onBid, onView }) => {
  // Match ASP.NET backend field names
  const {
    name,
    description,
    startingPrice,
    currentHighestBid,
    imageUrl,
    bidEndTime,
    bidStartTime,
    id,
  } = auction;

  // Build correct image source
  const resolvedImage = useMemo(() => {
    if (!imageUrl) {
      return "/placeholder-gem.svg";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `${API_ORIGIN}${imageUrl}`;
  }, [imageUrl]);

  // Compute time left
  const countdown = useMemo(() => {
    if (!bidEndTime) return "Ongoing";
    const end = dayjs(bidEndTime);
    const diff = dayjs.duration(end.diff(dayjs()));
    if (diff.asMilliseconds() <= 0) return "Closed";

    const parts = [
      diff.days() > 0 ? `${diff.days()}d` : null,
      diff.hours() > 0 ? `${diff.hours()}h` : null,
      diff.minutes() > 0 ? `${diff.minutes()}m` : null,
    ].filter(Boolean);

    return parts.join(" ") || "< 1m";
  }, [bidEndTime]);

  return (
    <article className="card-lux flex h-full flex-col overflow-hidden">
      {/* Gem Image */}
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={resolvedImage}
          alt={name || "Gemstone"}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700">
          {countdown}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col space-y-4 p-6">
        <header className="space-y-2">
          <h3 className="font-playfair text-2xl text-gray-900">
            {name || "Untitled Gem"}
          </h3>
          <p className="text-sm text-gray-500">{description || "No description provided."}</p>
        </header>

        {/* Prices */}
        <dl className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <dt className="font-medium text-gray-500">Base price</dt>
            <dd className="text-lg font-semibold text-gray-900">
              LKR,{startingPrice?.toLocaleString() ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Highest bid</dt>
            <dd className="text-lg font-semibold text-emerald-700">
              LKR,
              {currentHighestBid?.toLocaleString() ??
                startingPrice?.toLocaleString() ??
                "—"}
            </dd>
          </div>
          <div className="col-span-2 flex justify-between text-xs text-gray-500">
            <span>
              Opens: {bidStartTime ? dayjs(bidStartTime).format("MMM D, YYYY h:mm A") : "TBA"}
            </span>
            <span>
              Ends: {bidEndTime ? dayjs(bidEndTime).format("MMM D, YYYY h:mm A") : "TBA"}
            </span>
          </div>
        </dl>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => onView?.(id)}
          >
            View details
          </Button>
          <Button className="flex-1" onClick={() => onBid(auction)}>
            Place bid
          </Button>
        </div>
      </div>
    </article>
  );
};

export default Card;
