"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeSwitcherProps {
  toggleKey?: string;
  showIndicator?: boolean;
}

function ThemeSwitcher(props: ThemeSwitcherProps) {
  const { toggleKey = "t", showIndicator = true } = props;
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(
    function () {
      function handleKeyPress(event: KeyboardEvent): void {
        const target = event.target as HTMLElement;
        const isInput =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target.isContentEditable;

        if (!isInput && event.key.toLowerCase() === toggleKey.toLowerCase()) {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
        }
      }

      window.addEventListener("keydown", handleKeyPress);

      return function cleanup() {
        window.removeEventListener("keydown", handleKeyPress);
      };
    },
    [resolvedTheme, setTheme, toggleKey],
  );

  return null;

  // if (!mounted || !showIndicator) {
  //   return null;
  // }

  // return (
  //   <div className="fixed right-4 bottom-4 bg-white p-3 text-black">
  //     <p className="font-mono text-sm">{resolvedTheme}</p>
  //   </div>
  // );
}

export default ThemeSwitcher;
