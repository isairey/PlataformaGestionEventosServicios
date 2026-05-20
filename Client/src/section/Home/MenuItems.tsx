import { useState, useEffect } from "react";
import customFetch from "@/utils/customFetch";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  pricePerPlate: number;
}

const MenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // fetch menu item data
    const fetchMenuItems = async () => {
      try {
        const { data } = await customFetch.get("/menu-items");
        setMenuItems(data.menuItems || []);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className="py-16 px-4 bg-gray-50 font-Mainfront">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-event-navy mb-12">
          Our Menu Selection
        </h2>
        <div className="relative">
          {/* display menu item using swiper */}
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{
              clickable: true,
              el: ".menu-pagination",
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
            {menuItems.map((item) => (
              <SwiperSlide key={item._id}>
                <div className="bg-white min-h-[400px] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                  <img
                    src={`http://localhost:5000/${item.image}`}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-event-navy mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-event-navy font-bold">
                        Rs .{item.pricePerPlate.toString()} /= per plate
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {item.category}
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

export default MenuItems;
