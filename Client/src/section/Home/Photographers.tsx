import { useState, useEffect } from "react";
import customFetch from "@/utils/customFetch";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface Photographer {
  _id: string;
  fullName: string;
  email: string;
  image: string;
  phoneNumber: string;
  experience: number;
  availability: boolean;
  ratings: number;
}

const Photographers = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // fetch photographers data
    const fetchPhotographers = async () => {
      try {
        const { data } = await customFetch.get("/photographers"); 
        const updatedPhotographers = (data.photographers || []).map((photographer: Photographer) => ({
          ...photographer,
          image: photographer.image.startsWith("http")
            ? photographer.image
            : `http://localhost:5000/${photographer.image}`,
        }));
        setPhotographers(updatedPhotographers);
      } catch (error) {
        console.error("Failed to fetch photographers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotographers();
  }, []);

  if (isLoading) return <div className="text-center py-16">Loading...</div>;

  return (
    <section className="py-16 px-4 bg-gray-50 font-Mainfront">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-event-navy mb-12">
          Meet Our Talented Photographers
        </h2>
        {photographers.length > 0 ? (
          <div className="relative">
            {/* display photographers using swiper */}
            <Swiper
              modules={[Pagination, Autoplay]}
              pagination={{
                clickable: true,
                el: ".photographer-pagination",
              }}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              speed={1000}
              spaceBetween={30}
              slidesPerView={1}
              loop={true}
              loopAdditionalSlides={2}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="pb-12"
            >
              {photographers.map((photographer) => (
                <SwiperSlide key={photographer._id}>
                  <div className="bg-white min-h-[400px] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                    <div className="relative">
                      <img
                        src={photographer.image}
                        alt={photographer.fullName}
                        className="w-full h-80 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/150";
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          ⭐ {photographer.ratings.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-event-navy mb-2">
                        {photographer.fullName}
                      </h3>
                      <p className="text-gray-600 mb-2 line-clamp-2">
                        {photographer.email}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-event-navy font-bold">
                          {photographer.experience} Years Experience
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            photographer.availability ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {photographer.availability ? "Available" : "Booked"}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">
                        Contact: {photographer.phoneNumber}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="flex justify-center gap-2 photographer-pagination" />
          </div>
        ) : (
          <p className="text-center text-gray-600">No photographers available at the moment.</p>
        )}
      </div>
    </section>
  );
};

export default Photographers;