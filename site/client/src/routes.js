// @material-ui/icons
// import LocationCity from "@material-ui/icons/LocationCity";
// import Dashboard from "@material-ui/icons/Dashboard";
// import LibraryBooks from "@material-ui/icons/LibraryBooks";
import PersonIcon from "@material-ui/icons/Person";
// core components/views for Admin layout
// import Dev from "views/Dev/Dev.js";
// import DashboardPage from "views/Dashboard/Dashboard.js";
// core components/views for RTL layout
// import SiteManagementDev from "views/SiteManagement/SiteManagementDev.js";
import Test from "views/Test/Test.js";
import UserProfile from "views/UserProfile/UserProfile";
import Developer from "views/Developer/Developer";
import AdminPage from "views/Admin/AdminPage";
import SocketDevTest from "views/SocketDevTest/SocketDevTest";
import LiveEmStatus from "views/LiveEmStatus/LiveEmStatus";
import SiteSetup from "views/SiteSetup/SiteSetup";

const dashboardRoutes = [
  {
    path: "/live-em-status",
    name: "Live EM Status",
    icon: "map",
    component: LiveEmStatus,
    layout: "/admin",
    access: 1,
  },
  // {
  //   path: "/site-management",
  //   name: "Site management",
  //   icon: "map",
  //   component: SiteManagementDev,
  //   layout: "/admin",
  //   access: 1,
  // },
  {
    path: "/em-test-reports",
    name: "EM Test Reports",
    icon: "content_paste",
    component: Test,
    layout: "/admin",
    access: 1,
  },
  // {
  //   path: "/test",
  //   name: "Test History",
  //   icon: "content_paste",
  //   component: Test,
  //   layout: "/admin",
  //   access: 1,
  // },
  // {
  //   path: "/configuration",
  //   name: "Test configuration",
  //   icon: "schedule",
  //   component: Schedule,
  //   layout: "/admin",
  // },
  {
    path: "/trialtest",
    name: "Site Setup",
    icon: "settings_applications",
    component: SiteSetup,
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
