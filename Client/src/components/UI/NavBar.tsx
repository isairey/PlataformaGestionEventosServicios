import { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import logo from "/Images/NavBar/logo.webp";
import ContactInfo from "@/components/ContactInfo";
import CustomButton from "@/components/UI/Button";
import { FiLogIn, FiUserPlus, FiLogOut, FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import customFetch from "@/utils/customFetch";
import { toast } from "react-hot-toast";

// Define NavItems type and data
interface NavItem {
  title: string;
  path: string;
  subItems: { title: string; path: string }[];
}

const NavItems: NavItem[] = [
  { title: "Home", path: "/", subItems: [] },
  {
    title: "Events",
    path: "/events",
    subItems: [
      { title: "Upcoming Events", path: "/events/upcoming" },
      { title: "Past Events", path: "/events/past" },
    ],
  },
  {
    title: "Musician",
    path: "/musician",
    subItems: [],
  },
  { title: "About", path: "/about", subItems: [] },
  {
    title: "Contact",
    path: "/contact",
    subItems: [],
  },
];

interface User {
  role: string;
  fullName: string;
  email: string;
}

function NavComponent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");
  const [activeItem, setActiveItem] = useState("");
  const [activeSubItem, setActiveSubItem] = useState("");
  const dropDownRef = useRef(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropDownRef.current &&
        !(dropDownRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setOpenDropdown("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data } = await customFetch.get("/users/current-user");
        setCurrentUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    getCurrentUser();
  }, []);

  const toggleDropdown = (title: string) => {
    setOpenDropdown(openDropdown === title ? "" : title);
  };

  const isActive = (path: string) => window.location.pathname === path;

  const handleItemClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.subItems.length > 0) {
      e.preventDefault();
      toggleDropdown(item.title);
    }
    setActiveItem(item.title);
  };

  const handleSubItemClick = (
    subItem: { title: string; path: string },
    parentItem: NavItem
  ) => {
    setActiveSubItem(subItem.title);
    setOpenDropdown("");
    setActiveItem(parentItem.title);
  };

  const handleLogout = async () => {
    try {
      await customFetch.post("/auth/logout");
      setCurrentUser(null);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  return (
    <div className={`flex flex-col w-full ${isScrolled ? "shadow-md" : ""}`}>
      <div className="hidden xl:block">
        <ContactInfo />
      </div>
      <div
        className={`flex items-center justify-between w-full xl:flex px-[55px] py-[17px] bg-event-white max-w-[1920px] mx-auto ${
          isScrolled ? "border-b border-event-charcoal" : ""
        }`}
        ref={dropDownRef}
      >
        <div className="flex items-center">
          <img src={logo} alt="" className="2xl:w-[201px] w-[130px]" />
        </div>

        <ul className="flex space-x-3 2xl:space-x-6 text-nowrap">
          {NavItems.map((item) => (
            <li key={item.title} className="relative">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => toggleDropdown(item.title)}
              >
                <a
                  href={item.subItems.length === 0 ? item.path : ""}
                  onClick={(e) => handleItemClick(item, e)}
                  className={`text-black hover:text-event-red
                    ${
                      !currentUser && !activeItem && item.title === "Home"
                        ? "font-bold"
                        : ""
                    } ${
                    isActive(item.path) || activeItem === item.title
                      ? "font-bold"
                      : ""
                  }`}
                >
                  {item.title}
                </a>
                {item.subItems.length > 0 && (
                  <button>
                    {openDropdown === item.title ? (
                      <MdKeyboardArrowUp size={18} />
                    ) : (
                      <MdKeyboardArrowDown size={18} />
                    )}
                  </button>
                )}
              </div>
              {openDropdown === item.title && item.subItems.length > 0 && (
                <div className="absolute z-10 w-48 py-2 mt-2 bg-event-white rounded-md shadow-lg">
                  {item.subItems.map((subItem) => (
                    <a
                      key={subItem.title}
                      href={subItem.path}
                      className={`block px-4 py-2 text-sm hover:bg-event-navy hover:text-white
                        ${
                          activeSubItem === subItem.title
                            ? "bg-event-navy text-white"
                            : "text-event-charcoal"
                        }`}
                      onClick={() => handleSubItemClick(subItem, item)}
                    >
                      {subItem.title}
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-x-4">
          {currentUser ? (
            <>
              <Link to={`/${currentUser.role}-dashboard`}>
                <CustomButton
                  title={`${
                    currentUser.role === "admin"
                      ? "Admin Dashboard"
                      : "User Dashboard"
                  }`}
                  variant="outline"
                  icon={<FiUser className="w-8 h-4" />}
                  iconPosition="left"
                  fitWidth={true}
                  className="text-nowrap"
                />
              </Link>
              <CustomButton
                title="Logout"
                variant="outline"
                icon={<FiLogOut className="w-4 h-4" />}
                iconPosition="left"
                onClick={handleLogout}
              />
            </>
          ) : (
            <>
              <Link to="/signup">
                <CustomButton
                  title="SignUp"
                  variant="outline"
                  icon={<FiUserPlus className="w-4 h-4" />}
                  iconPosition="left"
                  fitWidth={true}
                />
              </Link>
              <Link to="/signin">
                <CustomButton
                  title="Login"
                  variant="outline"
                  icon={<FiLogIn className="w-4 h-4" />}
                  iconPosition="left"
                />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavComponent;
