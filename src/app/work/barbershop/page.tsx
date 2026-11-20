import { barberBody, barberDisplay } from "../fonts";
import { demoMetadata } from "../demo-metadata";
import { DemoShell } from "@/components/work/DemoShell";
import { BarbershopDemo } from "@/components/work/demos/BarbershopDemo";

export const metadata = demoMetadata("barbershop");

export default function BarbershopPage() {
  return (
    <DemoShell
      id="barbershop"
      className={`${barberDisplay.variable} ${barberBody.variable} min-h-screen bg-[#0E0E0E] font-[family-name:var(--demo-body)] text-[#EFE6D6] [&_main_:is(p,li,h1,h2,h3,h4,h5,h6)]:font-[family-name:var(--demo-body)] antialiased [color-scheme:dark] selection:bg-[#C9A45C] selection:text-[#0E0E0E]`}
    >
      <BarbershopDemo />
    </DemoShell>
  );
}
