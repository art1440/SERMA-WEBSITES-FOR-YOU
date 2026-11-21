import { beautyBody, beautyDisplay } from "../fonts";
import { demoMetadata } from "../demo-metadata";
import { DemoShell } from "@/components/work/DemoShell";
import { BeautyDemo } from "@/components/work/demos/BeautyDemo";

export const metadata = demoMetadata("beauty");

// Hard-coded deep-sage palette with color-scheme: dark, identical in either OS theme.
export default function BeautyPage() {
  return (
    <DemoShell
      id="beauty"
      className={`${beautyDisplay.variable} ${beautyBody.variable} min-h-screen bg-[#1E2A24] text-[#E8EFE9] antialiased lining-nums [color-scheme:dark] selection:bg-[#9CC5A6] selection:text-[#1E2A24]`}
    >
      <BeautyDemo />
    </DemoShell>
  );
}
