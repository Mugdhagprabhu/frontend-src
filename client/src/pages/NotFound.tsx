import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b161b] text-white">
      <Card className="w-full max-w-lg mx-4 shadow-2xl border border-[#223c47] bg-[#13242b]">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#f87171]/20 rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-[#f87171]" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">404</h1>

          <h2 className="text-xl font-semibold text-[#00f0a0] mb-4">
            Page Not Found
          </h2>

          <p className="text-[#cbd5e1] mb-8 leading-relaxed">
            Sorry, the operational page you are looking for doesn't exist.
            <br />
            It may have been moved or archived.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGoHome}
              className="bg-[#00f0a0] hover:bg-[#00d68f] text-[#091216] font-bold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}