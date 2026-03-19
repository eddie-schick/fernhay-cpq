import {
  BuildMyVehicleIcon,
  BuildMyVehicleSelectedIcon,
  ContactIcon,
  InventoryIcon,
  InventorySelectedIcon,
  MyOrdersIcon,
  MyOrdersSelectedIcon,
} from "~/global/icons";

import RoutePaths from "./route-paths";

const navLinks = [
  {
    id: 1,
    title: "Build My Vehicle",
    icon: BuildMyVehicleIcon,
    activeIcon: BuildMyVehicleSelectedIcon,
    path: RoutePaths.BUILD_MY_VEHICLE_PAGE,
  },
  {
    id: 2,
    title: "Manage Orders",
    icon: MyOrdersIcon,
    activeIcon: MyOrdersSelectedIcon,
    path: RoutePaths.MY_ORDERS,
  },
  {
    id: 3,
    title: "Manage Inventory",
    icon: InventoryIcon,
    activeIcon: InventorySelectedIcon,
    path: RoutePaths.MANAGE_INVENTORY,
  },
  {
    id: 4,
    title: "Contact Us",
    icon: ContactIcon,
    activeIcon: ContactIcon,
    noPath: true,
    path: "",
  },
];

export default navLinks;
