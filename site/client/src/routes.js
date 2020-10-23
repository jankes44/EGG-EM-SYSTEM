// @material-ui/icons
import LocationCity from "@material-ui/icons/LocationCity";
import Dashboard from "@material-ui/icons/Dashboard";
// import LibraryBooks from "@material-ui/icons/LibraryBooks";
import PersonIcon from "@material-ui/icons/Person";
// core components/views for Admin layout
// import Dev from "views/Dev/Dev.js";
import DashboardPage from "views/Dashboard/Dashboard.js";
// core components/views for RTL layout
import SiteManagementDev from "views/SiteManagementInDev/SiteManagementDev.js";
import Test from "views/Test/Test.js";
import UserProfile from "views/UserProfile/UserProfile";
import TrialTest from "views/TrialTest/TrialTest";
import Developer from "views/Developer/Developer";
import AdminPage from "views/Admin/AdminPage";
import SocketDevTest from "views/SocketDevTest/SocketDevTest";

const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: Dashboard,
    component: DashboardPage,
    layout: "/admin",
    access: 1,
  },
  {
    path: "/management",
    name: "Site Management",
    icon: LocationCity,
    component: SiteManagementDev,
    layout: "/admin",
    access: 1,
  },
  {
    path: "/test",
    name: "Test History",
    icon: "content_paste",
    component: Test,
    layout: "/admin",
    access: 1,
  },
  // {
  //   path: "/configuration",
  //   name: "Test configuration",
  //   icon: "schedule",
  //   component: Schedule,
  //   layout: "/admin",
  // },
  {
    path: "/trialtest",
    name: "Site Test",
    icon: "assignment",
    component: TrialTest,
    layout: "/admin",
    access: 2,
  },
  {
    path: "/profile",
    name: "User Profile",
    icon: PersonIcon,
    component: UserProfile,
    layout: "/admin",
    access: 1,
  },
  {
    path: "/administration",
    name: "Admin Panel",
    icon: "supervised_user_circle",
    component: AdminPage,
    layout: "/admin",
    access: 3,
  },
  {
    path: "/socket-dev-test",
    name: "Socket Test",
    icon: "developer_mode",
    component: SocketDevTest,
    layout: "/admin",
    access: 99,
  },
  {
    path: "/developer",
    name: "Developer",
    icon: "developer_mode",
    component: Developer,
    layout: "/admin",
    access: 99,
  },
];

export default dashboardRoutes;
