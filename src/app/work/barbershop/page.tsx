import { barberBody, barberDisplay } from "../fonts";
import { demoMetadata } from "../demo-metadata";
import { DemoShell } from "@/components/work/DemoShell";
import { BarbershopDemo } from "@/components/work/demos/BarbershopDemo";

export const metadata = demoMetadata("barbershop");

export default function BarbershopPage() {
  return (
    <DemoShell
      id="barbershop"
      className={`${barberDisplay.variable} ${barberBody.variable} min-h-screen bg-[#0E0E0E] text-[#EFE6D6] antialiased [color-scheme:dark] selection:bg-[#C9A45C] selection:text-[#0E0E0E]`}
    >
      <BarbershopDemo />
    </DemoShell>
  );
}
