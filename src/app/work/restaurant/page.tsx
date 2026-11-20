import { restaurantBody, restaurantDisplay } from "../fonts";
import { demoMetadata } from "../demo-metadata";
import { DemoShell } from "@/components/work/DemoShell";
import { RestaurantDemo } from "@/components/work/demos/RestaurantDemo";

export const metadata = demoMetadata("restaurant");

// Hard-coded ember palette with color-scheme: dark, identical in either OS theme.
export default function RestaurantPage() {
  return (
    <DemoShell
      id="restaurant"
      className={`${restaurantDisplay.variable} ${restaurantBody.variable} min-h-screen bg-[#2A0F0C] text-[#F7E4CF] antialiased lining-nums [color-scheme:dark] selection:bg-[#E0902F] selection:text-[#2A0F0C]`}
    >
      <RestaurantDemo />
    </DemoShell>
  );
}
