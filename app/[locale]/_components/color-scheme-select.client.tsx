"use client";

import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import type { Key, ReactNode } from "react";
import { Select, SelectValue } from "react-aria-components";

import { IconButton } from "@/components/ui/icon-button";
import { ListBox, ListBoxItem } from "@/components/ui/listbox";
import { Popover } from "@/components/ui/popover";
import type { ColorScheme } from "@/lib/color-scheme-script";
import { useColorScheme } from "@/lib/use-color-scheme";

interface ColorSchemeSelectProps {
	items: Record<ColorScheme | "system", string>;
	label: string;
}

export function ColorSchemeSelect(props: Readonly<ColorSchemeSelectProps>): ReactNode {
	const { items, label } = props;

	const { colorSchemeState, setColorScheme } = useColorScheme();

	function onSelectionChange(key: Key) {
		const value = key as keyof ColorSchemeSelectProps["items"];

		setColorScheme(value === "system" ? null : value);
	}

	const selectedKey = colorSchemeState.kind === "system" ? "system" : colorSchemeState.colorScheme;

	const icons = {
		dark: MoonIcon,
		light: SunIcon,
		system: LaptopIcon,
	};

	const Icon = icons[colorSchemeState.colorScheme];

	return (
		<Select
			aria-label={label}
			name="color-scheme"
			onSelectionChange={onSelectionChange}
			selectedKey={selectedKey}
		>
			<IconButton className="p-3" label={<SelectValue className="sr-only" />}>
				<Icon aria-hidden={true} className="size-6 shrink-0 text-icon-neutral" data-slot="icon" />
			</IconButton>
			<Popover placement="bottom">
				<ListBox className="min-w-40">
					{Object.entries(items).map(([id, label]) => {
						const Icon = icons[id as keyof typeof items];

						return (
							<ListBoxItem key={id} className="gap-x-3" id={id} textValue={label}>
								<Icon aria-hidden={true} className="size-5 text-icon-neutral" data-slot="icon" />
								{label}
							</ListBoxItem>
						);
					})}
				</ListBox>
			</Popover>
		</Select>
	);
}
