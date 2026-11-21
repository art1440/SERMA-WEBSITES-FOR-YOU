import { salonBody, salonDisplay } from "../fonts";
import { demoMetadata } from "../demo-metadata";
import { DemoShell } from "@/components/work/DemoShell";
import { SalonDemo } from "@/components/work/demos/SalonDemo";

export const metadata = demoMetadata("salon");

// --salon-accent / --salon-ink default to plum; the ColourRibbon overrides them inline on this root.
export default function SalonPage() {
  return (
    <DemoShell
      id="salon"
      className={`${salonDisplay.variable} ${salonBody.variable} min-h-screen bg-[#F6E9EA] text-[#3B1F2B] antialiased lining-nums [--salon-accent:#9B4A6B] [--salon-ink:#9B4A6B] [color-scheme:light] selection:bg-[#3B1F2B] selection:text-[#F6E9EA]`}
    >
      <SalonDemo />
    </DemoShell>
  );
}
