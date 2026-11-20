import { contractorBody, contractorDisplay } from "../fonts";
import { demoMetadata } from "../demo-metadata";
import { DemoShell } from "@/components/work/DemoShell";
import { ContractorDemo } from "@/components/work/demos/ContractorDemo";

export const metadata = demoMetadata("contractor");

// Hard-coded drawing-set palette with color-scheme: dark, identical in either OS theme.
export default function ContractorPage() {
  return (
    <DemoShell
      id="contractor"
      className={`${contractorDisplay.variable} ${contractorBody.variable} min-h-screen bg-[#0F2440] text-[#E9F0FA] antialiased lining-nums [color-scheme:dark] selection:bg-[#FF7A1A] selection:text-[#0F2440]`}
    >
      <ContractorDemo />
    </DemoShell>
  );
}
