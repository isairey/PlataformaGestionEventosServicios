import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast, Toaster } from "react-hot-toast";
import { AxiosError } from "axios";
import customFetch from "../../utils/customFetch";
import { FaStar } from "react-icons/fa";
import { BounceLoader } from "react-spinners";

interface EventReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    fullName: string;
  };
  eventId: {
    _id: string;
    title: string;
  };
}

interface UserEvent {
  _id: string;
  title: string;
  status: string;
  date: string;
  hasReviewed: boolean;
  review?: EventReview;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

// ReviewForm component remains unchanged
function ReviewForm({
  eventId,
  onSuccess,
  initialReview,
}: {
  eventId: string;
  onSuccess: () => void;
  initialReview?: EventReview;
}) {
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [comment, setComment] = useState(initialReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialReview) {
        await customFetch.patch(`/reviews/${initialReview._id}`, {
          rating,
          comment,
        });
        toast.success("Review updated successfully");
      } else {
        await customFetch.post("/reviews", {
          eventId,
          rating,
          comment,
        });
        toast.success("Review submitted successfully");
      }
      onSuccess();
    } catch (error) {
      const err = error as AxiosError<{ msg: string }>;
      toast.error(err.response?.data?.msg || "Failed to process review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <Toaster position="top-center" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-4 border rounded-md focus:ring-event-red focus:border-event-red"
          rows={4}
          placeholder="Write your review..."
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-event-red text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
      >
        {isSubmitting
          ? "Processing..."
          : initialReview
          ? "Update Review"
          : "Submit Review"}
      </button>
    </form>
  );
}

function ReviewSection() {
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userReviews, setUserReviews] = useState<EventReview[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [selectedReview, setSelectedReview] = useState<EventReview | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editReview, setEditReview] = useState<EventReview | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchUserEvents();
    fetchUserReviews();
  }, []);

  const fetchUserEvents = async () => {
    try {
      const { data } = await customFetch.get("/events/my-events");
      const eligibleEvents = data.events.filter(
        (event: UserEvent) =>
          ["completed", "confirmed"].includes(event.status) &&
          !event.hasReviewed
      );
      setUserEvents(eligibleEvents);
    } catch (error) {
      const err = error as AxiosError<{ msg: string }>;
      toast.error(err.response?.data?.msg || "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const { data } = await customFetch.get("/reviews/my-reviews");
      setUserReviews(data.reviews);
    } catch (error) {
      const err = error as AxiosError<{ msg: string }>;
      toast.error(err.response?.data?.msg || "Failed to fetch reviews");
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setEditReview(null);
    fetchUserEvents();
    fetchUserReviews();
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    try {
      await customFetch.delete(`/reviews/${reviewToDelete}`);
      toast.success("Review deleted successfully");
      fetchUserReviews();
      fetchUserEvents();
      setShowReviewModal(false);
      setSelectedReview(null);
    } catch (error) {
      const err = error as AxiosError<{ msg: string }>;
      toast.error(err.response?.data?.msg || "Failed to delete review");
    } finally {
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
    }
  };

  const ReviewModal = ({
    review,
    onClose,
  }: {
    review: EventReview;
    onClose: () => void;
  }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h3 className="text-xl font-semibold mb-4">{review.eventId.title}</h3>
          <div className="space-y-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={`h-5 w-5 ${
                    index < review.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-700">{review.comment}</p>
            <p className="text-sm text-gray-500">
              Reviewed on {format(new Date(review.createdAt), "MMM dd, yyyy")}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditReview(review);
                  setShowReviewModal(false);
                  setShowReviewForm(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteReview(review._id)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-20 backdrop-blur-md">
        <BounceLoader size={50} color="#EE1133" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster position="top-center" />
      <h2 className="text-2xl font-semibold mb-6">Event Reviews</h2>

      {showReviewForm ? (
        <div>
          <button
            onClick={() => {
              setShowReviewForm(false);
              setEditReview(null);
            }}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            ← Back to Events
          </button>
          <ReviewForm
            eventId={editReview?.eventId._id || selectedEvent}
            onSuccess={handleReviewSuccess}
            initialReview={editReview || undefined}
          />
        </div>
      ) : (
        <>
          {userEvents.length === 0 && userReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No events to review
            </div>
          ) : (
            <div className="space-y-6">
              {userEvents.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">
                    Select an Event to Review
                  </h3>
                  <div className="grid gap-4">
                    {userEvents.map((event) => (
                      <div
                        key={event._id}
                        className="border rounded-lg p-4 hover:border-event-red cursor-pointer"
                        onClick={() => {
                          setSelectedEvent(event._id);
                          setShowReviewForm(true);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-500">
                              {format(new Date(event.date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              event.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <button
                  onClick={() => setShowReviews(!showReviews)}
                  className="mb-4 text-event-red hover:text-red-700"
                >
                  {showReviews ? "Hide My Reviews" : "View My Reviews"}
                </button>

                {showReviews && (
                  <div className="grid gap-4">
                    {userReviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-white rounded-lg shadow p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium mb-2">
                              {review.eventId.title}
                            </h4>
                            <div className="flex gap-1 mb-2">
                              {[...Array(5)].map((_, index) => (
                                <FaStar
                                  key={index}
                                  className={`h-4 w-4 ${
                                    index < review.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-600">{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {format(new Date(review.createdAt), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedReview(review);
                                setShowReviewModal(true);
                              }}
                              className="text-sm text-blue-500 hover:text-blue-700"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {showReviewModal && selectedReview && (
        <ReviewModal
          review={selectedReview}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedReview(null);
          }}
        />
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
        title="Delete Review"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this review? This action cannot be undo.
          </p>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setReviewToDelete(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ReviewSection;