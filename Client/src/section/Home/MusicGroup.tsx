import { useState, useEffect } from "react";
import customFetch from "@/utils/customFetch";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Music group interface
interface MusicalGroup {
  _id: string;
  name: string;
  description: string;
  genre: string;
  price: number;
  members: string[];
  contactEmail: string;
  contactPhone: string;
  availableForEvents: boolean;
  rating: number;
  image: string;
}

const MusicalGroupsHome = () => {
  const [musicalGroups, setMusicalGroups] = useState<MusicalGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // fetch musical group data
  useEffect(() => {
    const fetchMusicalGroups = async () => {
      try {
        const { data } = await customFetch.get("/musical-group");
        setMusicalGroups(data.musicalGroups || []); 
      } catch (error) {
        console.error("Failed to fetch musical groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusicalGroups();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className="relative py-16 px-4 bg-gradient-to-b from-white via-gray-100 to-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/Images/Home/hero.webp')] opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-event-navy/5 to-transparent" />
      <div className="container mx-auto relative">
        <h2 className="text-3xl font-bold text-center text-event-navy mb-12">
          Featured Musical Groups
        </h2>
        <div className="relative">
          {/* display musical group using swiper */}
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{
              clickable: true,
              el: ".group-pagination", 
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
            {musicalGroups.map((group) => (
              <SwiperSlide key={group._id}>
                <div className="bg-white font-Mainfront min-h-[450px] rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={`http://localhost:5000/${group.image}`} 
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => (e.currentTarget.src = "/default-band-image.png")} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:via-black/40 transition-all duration-300" />
                    <div className="absolute bottom-4 left-4 bg-event-navy/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                      {group.genre}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-event-navy mb-2">
                      {group.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {group.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-event-navy font-bold">
                        Rs. {group.price.toFixed(2)}{" "}
                        <span className="text-sm text-gray-500">/event</span>
                      </span>
                      <span className="text-sm text-gray-500">
                        {group.contactPhone}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Rating: </span>
                      {group.rating}/5
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="flex justify-center gap-2 group-pagination" /> 
        </div>
      </div>
    </section>
  );
};

export default MusicalGroupsHome;