import { serviceBody, serviceDisplay } from "../fonts";
import { demoMetadata } from "../demo-metadata";
import { DemoShell } from "@/components/work/DemoShell";
import { ServiceDemo } from "@/components/work/demos/ServiceDemo";

export const metadata = demoMetadata("service");

// Hard-coded daylight palette with color-scheme: light, identical in either OS theme.
export default function ServicePage() {
  return (
    <DemoShell
      id="service"
      className={`${serviceDisplay.variable} ${serviceBody.variable} min-h-screen bg-[#EAF6F4] text-[#0C3A36] antialiased [color-scheme:light] selection:bg-[#FFD23F] selection:text-[#0C3A36]`}
    >
      <ServiceDemo />
    </DemoShell>
  );
}
