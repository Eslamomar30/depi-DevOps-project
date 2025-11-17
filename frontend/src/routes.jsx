import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  BookmarkIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { Home, Management } from "@/pages/dashboard";
import { SignIn } from "@/pages/auth";
import AddCertificates from "./pages/dashboard/certificates";
import AllCertificates from "./pages/dashboard/all_certificates";
import Clean from "./pages/dashboard/clean";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "الرئيسية",
        path: "/",
        element: <Home />,
      },
            {
        icon: <BookmarkIcon {...icon} />,
        name: "الشهادات",
        path: "/certificates",
        element: <AllCertificates />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "واجهة البحث والادارة",
        path: "/management",
        element: <Management />, 
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "اضافة الشهادات",
        path: "/students",
        element: <AddCertificates />,
      },
            {
        icon: <XMarkIcon {...icon} />,
        name: "حذف جميع الشهادات",
        path: "/clean",
        element: <Clean />,
      },
    ],
  },
];

export default routes;
