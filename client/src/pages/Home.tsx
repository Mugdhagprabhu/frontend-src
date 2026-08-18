import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Streamdown } from 'streamdown';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b161b] text-white">
      <main className="p-8 max-w-4xl space-y-4">
        <div className="flex items-center gap-2 text-[#00f0a0]">
          <Loader2 className="animate-spin" />
          <span className="font-semibold text-white">Operational Context</span>
        </div>
        <div className="rounded-lg border border-[#223c47] bg-[#13242b] p-5 text-[#cbd5e1]">
          <Streamdown>Any **markdown** content</Streamdown>
        </div>
        <Button className="bg-[#00f0a0] hover:bg-[#00d68f] text-[#091216] font-bold">
          Example Button
        </Button>
      </main>
    </div>
  );
}