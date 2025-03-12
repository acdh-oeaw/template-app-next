"use client";

import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import type { Key, ReactNode } from "react";
import { Button, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";

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
			<Button className="interactive rounded-2 hover:hover-overlay focus-visible:focus-outline focus-visible:focus-outline-offset-0 pressed:press-overlay grid place-content-center p-3">
				<Icon aria-hidden={true} className="text-icon-neutral size-6 shrink-0" />
				<SelectValue className="sr-only" />
			</Button>
			<Popover
				className="min-w-(--trigger-width) rounded-2 border-stroke-weak bg-background-overlay shadow-overlay placement-bottom:translate-y-1 placement-bottom:slide-in-from-top-2 entering:animate-in entering:fade-in-0 exiting:animate-out exiting:fade-out-0 exiting:zoom-out-95 border"
				placement="bottom"
			>
				<ListBox className="max-h-[inherit] min-w-40 overflow-auto py-2">
					{Object.entries(items).map(([id, label]) => {
						const Icon = icons[id as keyof typeof items];

						return (
							<ListBoxItem
								key={id}
								className="interactive text-small text-text-strong hover:hover-overlay focus-visible:focus-outline focus-visible:-focus-outline-offset-2 pressed:press-overlay selected:select-overlay-left selected:hover-overlay relative flex cursor-default select-none items-center gap-x-3 px-4 py-3"
								id={id}
								textValue={label}
							>
								<Icon aria-hidden={true} className="text-icon-neutral size-5" />
								{label}
							</ListBoxItem>
						);
					})}
				</ListBox>
			</Popover>
		</Select>
	);
}
