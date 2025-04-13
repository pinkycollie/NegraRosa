import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { User } from "@/lib/types";
import { Shield, Moon, Sun, User as UserIcon } from "lucide-react";

interface AppHeaderProps {
  user?: User;
}

export default function AppHeader({ user }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme toggle only happens client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-medium ml-2">NegraRosa Security</h1>
        </div>
        <div className="flex items-center">
          <button 
            className="p-2 rounded-full hover:bg-muted mr-2"
            onClick={toggleDarkMode}
            aria-label={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <div className="flex items-center ml-4">
            <UserIcon className="h-5 w-5 text-muted-foreground mr-2" />
            <span className="text-sm font-medium">
              {user ? user.fullName || user.username : "Guest User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
