import {
  Armchair,
  Camera,
  Drone,
  Dumbbell,
  Flower2,
  Footprints,
  Gamepad2,
  Headphones,
  Laptop,
  Sofa,
  Speaker,
  Smartphone,
  Watch,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId } from "@/types";

export const categoryIcons: Record<CategoryId, LucideIcon> = {
  audio: Headphones,
  mobile: Smartphone,
  computers: Laptop,
  wearables: Watch,
  photography: Camera,
  gaming: Gamepad2,
  "home-living": Sofa,
  fitness: Dumbbell,
};

export const productIcons: Record<string, LucideIcon> = {
  "pulse-anc-headphones": Headphones,
  "resonate-desk-speaker": Speaker,
  "skyeye-4k-drone": Drone,
  "harbor-linen-armchair": Armchair,
  "zenflow-yoga-mat": Flower2,
  "flexfit-training-sneakers": Footprints,
};

export const categoryGradients: Record<CategoryId, string> = {
  audio: "from-indigo-500 to-violet-500",
  mobile: "from-blue-500 to-cyan-400",
  computers: "from-slate-600 to-slate-400",
  wearables: "from-emerald-500 to-teal-400",
  photography: "from-amber-500 to-orange-400",
  gaming: "from-fuchsia-500 to-purple-500",
  "home-living": "from-rose-500 to-orange-400",
  fitness: "from-green-500 to-lime-400",
};
