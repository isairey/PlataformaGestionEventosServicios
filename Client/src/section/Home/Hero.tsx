import hero from "/Images/Home/hero.webp";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import customFetch from "../../utils/customFetch";

interface User {
  role: string;
  fullName: string;
  email: string;
}

function Hero() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data } = await customFetch.get("/users/current-user");
        setCurrentUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        setCurrentUser(null);
      }
    };
    getCurrentUser();
  }, []);

  const handlePlanEventClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Please login to plan an event");
      navigate("/signin");
      return;
    }

    navigate("/plan-event");
  };

  return (
    <div
      className="flex flex-col relative justify-center items-center xl:relative xl:items-baseline gap-y-5 xl:gap-y-0  xl:mt-0 
    w-full font-PlusSans px-[15px] md:px-0  xl:pr-0  max-w-[1920px] mx-auto mt-[15px] md:mt-0"
    >
      <div className="relative w-full ">
        <img src={hero} alt="Hero Image" className="" />
        <div className="absolute inset-0 bg-black/50" />
        {/* Content */}
        <div className="absolute left-[10%] top-[40%] -translate-y-1/2 z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 0.5,
            }}
            className="text-white font-Mainfront text-[40px] md:text-[56px] lg:text-[64px] font-bold leading-tight"
          >
            Make Your Event
          </motion.h1>

          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 1,
            }}
            className="text-event-red  font-Mainfront text-[40px] md:text-[56px] lg:text-[64px] font-bold leading-tight block"
          >
            Memorable
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 1.5,
            }}
            className="mt-6 text-lg  font-Mainfront md:text-xl text-gray-200 max-w-[600px]"
          >
            Create unforgettable experiences with our world-class facilities and
            expert support
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 2,
            }}
            className="mt-8"
          >
            <Link to="/plan-event" onClick={handlePlanEventClick}>
              <button className="bg-event-red hover:bg-red-700 text-white font-Mainfront px-8 py-3 rounded-lg transition-colors duration-300">
                Plan Event
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div
        className="flex  justify-center items-center xl:items-start text-center xl:text-left xl:justify-between
      xl:absolute xl:w-[49%] 2xl:w-[45%]"
      >
        <div className="font-PlusSans  flex flex-col items-center justify-center xl:items-start "></div>
      </div>
    </div>
  );
}

export default Hero;
