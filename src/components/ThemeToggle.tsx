import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../app/components/ui/dropdown-menu";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
                <span className="sr-only">Loading theme</span>
            </button>
        );
    }

    const currentIcon = () => {
        if (theme === "light") return <Sun size={16} />;
        if (theme === "dark") return <Moon size={16} />;
        return <Monitor size={16} />;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 dark:bg-white/5 bg-black/5 border border-white/10 dark:border-white/10 border-black/10 text-foreground hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/10 transition-colors cursor-pointer"
                    aria-label="Toggle theme"
                >
                    {currentIcon()}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={`flex items-center gap-2 cursor-pointer ${theme === "system" ? "bg-accent" : ""}`}
                >
                    <Monitor size={14} />
                    <span>System</span>
                    {theme === "system" && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={`flex items-center gap-2 cursor-pointer ${theme === "dark" ? "bg-accent" : ""}`}
                >
                    <Moon size={14} />
                    <span>Dark</span>
                    {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={`flex items-center gap-2 cursor-pointer ${theme === "light" ? "bg-accent" : ""}`}
                >
                    <Sun size={14} />
                    <span>Light</span>
                    {theme === "light" && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
