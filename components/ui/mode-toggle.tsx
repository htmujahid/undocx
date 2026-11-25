"use client";

import { useTheme } from "next-themes";
import { buttonVariants } from "~@/components/ui/button";
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "~@/components/ui/menu";
import { cn } from "~@/lib/utils";

const options = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "System", Icon: MonitorIcon },
];

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <Menu onAction={(value) => setTheme(String(value))}>
      <MenuTrigger aria-label="Theme" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-muted-foreground hover:text-foreground", className)}>
        <SunIcon className="dark:hidden" />
        <MoonIcon className="hidden dark:block" />
      </MenuTrigger>
      <MenuContent align="end">
        {options.map(({ value, label, Icon }) => (
          <MenuItem key={value} value={value} icon={<Icon />} trailing={<CheckIcon className={cn("size-3.5 text-primary", theme === value ? "visible" : "invisible")} />}>
            {label}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
