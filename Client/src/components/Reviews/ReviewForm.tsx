import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import customFetch from "../../utils/customFetch";
import { FaStar } from "react-icons/fa";

interface ReviewFormProps {
  eventId: string;
  onSuccess: () => void;
}

function ReviewForm({ eventId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await customFetch.post("/reviews", {
        eventId,
        rating,
        comment,
      });
      onSuccess();
    } catch (error) {
      const err = error as AxiosError<{ msg: string }>;
      toast.error(err.response?.data?.msg || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-1">
          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              className={`h-6 w-6 cursor-pointer ${
                index < rating ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setRating(index + 1)}
            />
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Write your review..."
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-event-red text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;
