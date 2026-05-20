import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/UI/Layout";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AdminLayout from "./pages/AdminDashboard/AdminLayout";
import UserLayout from "./pages/UserDashboard/UserLayout";
import Profile from "./pages/UserDashboard/Profile";
import Photographs from "./pages/AdminDashboard/pages/Photographs";
import Users from "./pages/AdminDashboard/pages/Users";
import MenuItems from "./pages/AdminDashboard/pages/MenuItems";
import EventPackages from "./pages/AdminDashboard/pages/EventPackages";
import MusicalGroup from "./pages/AdminDashboard/pages/MusicalGroup";
import Staff from "./pages/AdminDashboard/pages/Staff";
import EventVenues from "./pages/AdminDashboard/pages/EventVenues";
import Decorations from "./pages/AdminDashboard/pages/Decorations";
import Overview from "./pages/AdminDashboard/pages/Overview";
import PlanEventForm from "./pages/PlanEvent/PlanEventForm";
import MyEvents from "./pages/UserDashboard/MyEvents";
import EventOrders from "./pages/AdminDashboard/pages/EventOrders";
import Review from "./pages/UserDashboard/Review";
import RentalItem from "./pages/AdminDashboard/pages/RentalItem"

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="users" element={<Users />} />
        <Route path="event-orders" element={<EventOrders />} />
        <Route path="event-packages" element={<EventPackages />} />
        <Route path="event-venues" element={<EventVenues />} />
        <Route path="photographs" element={<Photographs />} />
        <Route path="menu-items" element={<MenuItems />} />
        <Route path="decorations" element={<Decorations />} />
        <Route path="musical" element={<MusicalGroup />} />
        <Route path="staf" element={<Staff />} />
        <Route path="rent" element={<RentalItem />} />
        <Route path="settings" />
      </Route>
    </Routes>
  );
};

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<Profile />} />
        <Route path="my-events" element={<MyEvents />} />
        <Route path="my-review" element={<Review />} />
        <Route path="bookings" />
        <Route path="notifications" />
        <Route path="schedule" />
        <Route path="settings" />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/plan-event" element={<PlanEventForm />} />
        </Route>
        <Route path="/admin-dashboard/*" element={<AdminRoutes />} />
        <Route path="/user-dashboard/*" element={<UserRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
