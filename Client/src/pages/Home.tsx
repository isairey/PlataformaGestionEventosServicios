import EventVenues from "@/section/Home/EventVenues";
import Hero from "@/section/Home/Hero";
import MenuItems from "@/section/Home/MenuItems";
import Photographer from "@/section/Home/Photographers";
import MusicalGroups from "@/section/Home/MusicGroup";
import Reviews from "@/section/Home/Reviews";

const Home = () => {
  return (
    <div>
      <Hero />
      <MenuItems />
      <EventVenues />
      <Photographer />
      <MusicalGroups/>
      <Reviews />
    </div>
  );
};

export default Home;
