import { useState, useEffect } from "react";
import customFetch from "@/utils/customFetch";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface Venue {
  _id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  capacity: {
    min: number;
    max: number;
  };
  price: number;
  images: string;
  pricePerHour: number;
}

const EventVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // fetch venu data
    const fetchVenues = async () => {
      try {
        const { data } = await customFetch.get("/venues");
        setVenues(data.venues || []);
      } catch (error) {
        console.error("Failed to fetch venues:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className="relative py-16 px-4 bg-gradient-to-b from-white via-gray-100 to-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/Images/Home/hero.webp')] opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-event-navy/5 to-transparent" />
      <div className="container mx-auto relative">
        <h2 className="text-3xl font-bold text-center text-event-navy mb-12">
          Stunning Event Venues
        </h2>
        <div className="relative">
          {/* display venu using swiper */}
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{
              clickable: true,
              el: ".venue-pagination",
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
            {venues.map((venue) => (
              <SwiperSlide key={venue._id}>
                <div className="bg-whit font-Mainfront min-h-[450px] rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={`http://localhost:5000/${venue.images[0]}`}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:via-black/40 transition-all duration-300" />
                    <div className="absolute bottom-4 left-4 bg-event-navy/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                      Capacity: {venue.capacity.min} - {venue.capacity.max}{" "}
                      guests
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-event-navy mb-2">
                      {venue.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {venue.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-event-navy font-bold">
                        Rs. {venue.pricePerHour}
                        <span className="text-sm text-gray-500">/hour</span>
                      </span>
                      <span className="text-sm text-gray-500">
                        {venue.location.city}, {venue.location.state}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="flex justify-center gap-2  menu-pagination" />
        </div>
      </div>
    </section>
  );
};

export default EventVenues;
