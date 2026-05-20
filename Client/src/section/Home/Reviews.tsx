import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FaStar } from "react-icons/fa";
import { BounceLoader } from "react-spinners";
import customFetch from "@/utils/customFetch";
import { AxiosError } from "axios";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  user: {
    fullName: string;
    avatar: string;
  };
  eventId: {
    title: string;
  };
}

function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await customFetch.get("/reviews");
      console.log(data);
      // Only show approved reviews
      const approvedReviews = data.reviews.filter(
        (review: Review) => review.status === "approved" || "pending"
      );
      setReviews(approvedReviews);
    } catch (error) {
      const err = error as AxiosError;
      console.error("Failed to fetch reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <BounceLoader size={50} color="#EE1133" />
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read about the experiences of our valued clients and their memorable
            events
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={`http://localhost:5000/${review.user?.avatar}`}
                  alt={review.user?.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {review.user?.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {review.eventId.title}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={`h-5 w-5 ${
                        index < review.rating
                          ? "text-yellow-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic">"{review.comment}"</p>
              </div>

              <div className="text-sm text-gray-500">
                {format(new Date(review.createdAt), "MMMM dd, yyyy")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Reviews;
