import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Theme = "system" | "light" | "dark";
const key = "goodworks.theme.v1";
function readTheme(): Theme {
  try {
    const value = localStorage.getItem(key);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function ThemeControl() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = resolved;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", resolved === "dark" ? "#18181b" : "#fafafa");
    };
    const sync = (event: StorageEvent) => {
      if (event.key === key || event.key === null) setTheme(readTheme());
    };
    apply();
    media.addEventListener("change", apply);
    window.addEventListener("storage", sync);
    return () => {
      media.removeEventListener("change", apply);
      window.removeEventListener("storage", sync);
    };
  }, [theme]);
  const Icon = theme === "system" ? Monitor : theme === "dark" ? Moon : Sun;
  return (
    <label className="theme-control">
      <Icon size={15} aria-hidden="true" />
      <span className="sr-only">Appearance</span>
      <select
        value={theme}
        onChange={(event) => {
          const next = event.target.value as Theme;
          setTheme(next);
          try {
            localStorage.setItem(key, next);
          } catch {
            /* Keep the selection for this session. */
          }
        }}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
