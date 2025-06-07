import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface NavbarProps {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

export function Navbar({ toggleDarkMode, isDarkMode }: NavbarProps) {
  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                                                                                                                                                                                                                                                                <div className="flex items-center justify-between h-16">                                                                                    
          <div className="flex items-center flex-shrink-0 gap-2">
            <Image src="/ULSESA%20LOGO%20SVG.svg" alt="Logo" width={32} height={32} />
            <h1 className="text-2xl font-bold">GPA Calculator</h1>
          </div>                                                                                                                                                                                                                                                       
          <div>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
