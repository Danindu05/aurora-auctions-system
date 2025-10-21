import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import Button from "../components/Button.jsx";
import { useAuctionApi } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const AddAuction = () => {
  const { createAuction } = useAuctionApi();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      startingPrice: "",
      imageFile: null,
      bidStartTime: "",
      bidEndTime: "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (new Date(data.bidEndTime) <= new Date(data.bidStartTime)) {
        toast.error("End time must be after the start time.");
        return;
      }

      const formData = new FormData();

      // Match backend model field names exactly
      formData.append("Name", data.name);
      formData.append("Description", data.description);
      formData.append("StartingPrice", Number(data.startingPrice));
      formData.append("BidStartTime", data.bidStartTime);
      formData.append("BidEndTime", data.bidEndTime);

      // File upload support
      if (data.imageFile && data.imageFile[0]) {
        formData.append("ImageFile", data.imageFile[0]);
      }

      await createAuction(formData);
      toast.success("Auction created successfully!");

      reset();
      navigate("/auctions");
    } catch (error) {
      console.error("Failed to create auction:", error);
      toast.error(error?.response?.data?.message || "Unable to create auction");
    }
  });

  return (
    <div className="container-lux space-y-10 py-16">
      <Toaster position="top-right" />
      <header className="space-y-2">
        <h1 className="heading-lux">List a New Gemstone</h1>
        <p className="subheading-lux">
          Share its provenance, imagery, and opening bid to invite collectors.
        </p>
      </header>

      <form className="card-lux space-y-6 p-10" onSubmit={onSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Gem Name
            </label>
            <input
              type="text"
              className="w-full rounded-full border border-emerald-100 bg-white px-5 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Aurora Sapphire"
              {...register("name", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Starting Price (LKR)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-full border border-emerald-100 bg-white px-5 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="250000"
              {...register("startingPrice", { required: true })}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Bidding starts
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-full border border-emerald-100 bg-white px-5 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              {...register("bidStartTime", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Bidding ends
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-full border border-emerald-100 bg-white px-5 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              {...register("bidEndTime", { required: true })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Description
          </label>
          <textarea
            rows={4}
            className="w-full rounded-3xl border border-emerald-100 bg-white px-5 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Provide details about clarity, cut, carat, and provenance"
            {...register("description", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-full border border-emerald-100 bg-white px-5 py-3 text-sm"
            {...register("imageFile", { required: true })}
          />
          <p className="text-xs text-gray-500">
            Upload a clear image of the gemstone (JPG, PNG, WEBP).
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/auctions")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Publish Auction"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddAuction;
