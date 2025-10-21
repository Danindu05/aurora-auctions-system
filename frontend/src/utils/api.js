import { useMemo } from "react";
import { useApi } from "../context/ApiContext.jsx";

export const useAuctionApi = () => {
  const { client } = useApi();

  return useMemo(
    () => ({
      // ✅ Fetch all auctions
      getAuctions: async (params = {}) => {
        const response = await client.get("/AuctionItems", { params });
        return response.data;
      },

      // ✅ Create new auction — supports both FormData and plain payloads
      createAuction: async (payload) => {
        let dataToSend;

        if (payload instanceof FormData) {
          // Already built in AddAuction.jsx
          dataToSend = payload;
        } else {
          // Fallback: build FormData manually
          const formData = new FormData();
          formData.append("Name", payload.name || payload.title);
          formData.append("Description", payload.description);
          formData.append(
            "StartingPrice",
            Number(payload.startingPrice || payload.basePrice || 0)
          );

          if (payload.bidStartTime) {
            formData.append("BidStartTime", payload.bidStartTime);
          }

          if (payload.bidEndTime) {
            formData.append("BidEndTime", payload.bidEndTime);
          }

          if (payload.imageFile instanceof File) {
            formData.append("ImageFile", payload.imageFile);
          } else if (payload.imageUrl) {
            formData.append("ImageUrl", payload.imageUrl);
          }

          dataToSend = formData;
        }

        const response = await client.post("/AuctionItems", dataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
      },

      getAuctionById: async (auctionId) => {
        const response = await client.get(`/AuctionItems/${auctionId}`);
        return response.data;
      },

      // ✅ Place bid
      placeBid: async (auctionId, payload) => {
        const response = await client.post(`/Bids`, {
          auctionItemId: auctionId,
          amount: Number(payload.amount),
        });
        return response.data;
      },

      // ✅ Fetch bids for one auction
      getBids: async (auctionId) => {
        const response = await client.get(`/Bids/${auctionId}`);
        return response.data;
      },
    }),
    [client]
  );
};
