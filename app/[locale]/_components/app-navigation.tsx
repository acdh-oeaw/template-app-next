"use client";

import { ChevronDownIcon, ChevronRightIcon, MenuIcon, XIcon } from "lucide-react";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import { Fragment, type ReactNode } from "react";
import { chain } from "react-aria";
import {
	Button,
	Dialog,
	DialogTrigger,
	Disclosure,
	DisclosurePanel,
	Heading,
	Menu,
	MenuItem,
	type MenuItemProps,
	MenuTrigger,
	Modal,
	ModalOverlay,
	Popover,
	Separator,
} from "react-aria-components";

import { Logo } from "@/components/logo";
import { NavLink, type NavLinkProps } from "@/components/nav-link";
import { Drawer } from "@/components/ui/drawer";
import { IconButton } from "@/components/ui/icon-button";
import { usePathname, useRouter } from "@/lib/navigation/navigation";
import { isCurrentPage } from "@/lib/navigation/use-nav-link";

interface NavigationLink {
	type: "link";
	href: NonNullable<NavLinkProps["href"]>;
	label: string;
}

interface NavigationSeparator {
	type: "separator";
}

interface NavigationMenu {
	type: "menu";
	label: string;
	children: Record<string, NavigationLink | NavigationSeparator>;
}

export type NavigationItem = NavigationLink | NavigationSeparator | NavigationMenu;

interface AppNavigationProps {
	label: string;
	navigation: { home: NavigationLink } & Record<string, NavigationItem>;
}

export function AppNavigation(props: Readonly<AppNavigationProps>): ReactNode {
	const { label, navigation } = props;

	const pathname = usePathname();

	return (
		<nav aria-label={label} className="hidden md:flex md:gap-x-12">
			<NavLink
				className="interactive -ml-2 grid shrink-0 place-content-center self-center rounded-2 p-2 focus-visible:focus-outline"
				href={navigation.home.href}
			>
				<Logo className="h-8 w-auto text-text-strong" />
				<span className="sr-only">{navigation.home.label}</span>
			</NavLink>

			<ul className="flex flex-wrap text-small" role="list">
				{Object.entries(navigation).map(([id, item]) => {
					switch (item.type) {
						case "link": {
							return (
								<li key={id}>
									<NavLink
										className="interactive inline-flex px-4 py-6 text-text-strong hover:hover-overlay focus-visible:focus-outline aria-[current]:select-overlay-bottom pressed:press-overlay"
										href={item.href}
									>
										{item.label}
									</NavLink>
								</li>
							);
						}

						case "menu": {
							/**
							 * Menu items are not announced as links, so we should use selection state
							 * instead of `aria-current`. Unfortunately, we cannot set selection state
							 * on individual menu items, but only on the menu itself.
							 *
							 * @see https://github.com/adobe/react-spectrum/issues/7587
							 */
							const selectedKeys = new Set<string>();
							Object.entries(item.children).forEach(([id, item]) => {
								if (item.type === "link" && isCurrentPage(item.href, pathname)) {
									selectedKeys.add(id);
								}
							});

							return (
								<li key={id}>
									<MenuTrigger>
										<Button className="interactive inline-flex items-center gap-x-2 px-4 py-6 text-text-strong hover:hover-overlay focus-visible:focus-outline pressed:press-overlay">
											{item.label}
											<ChevronDownIcon
												aria-hidden={true}
												className="size-6 shrink-0 text-icon-neutral"
												data-slot="icon"
											/>
										</Button>
										<Popover
											className="min-w-(--trigger-width) rounded-2 border border-stroke-weak bg-background-overlay shadow-overlay entering:placement-bottom:animate-popover-bottom-in exiting:placement-bottom:animate-popover-bottom-out"
											placement="bottom"
										>
											<Menu
												className="max-h-[inherit] min-w-40 overflow-auto py-2"
												selectedKeys={selectedKeys}
											>
												{Object.entries(item.children).map(([id, item]) => {
													switch (item.type) {
														case "link": {
															return (
																<NavigationMenuItem
																	key={id}
																	className="interactive flex cursor-pointer items-center gap-x-3 px-4 py-3 text-small text-text-strong select-none hover:hover-overlay focus-visible:focus-outline focus-visible:-focus-outline-offset-2 pressed:press-overlay selected:select-overlay-left"
																	href={item.href}
																	textValue={item.label}
																>
																	{item.label}
																</NavigationMenuItem>
															);
														}

														case "separator": {
															return (
																<Separator
																	key={id}
																	className="my-1 w-full border-b border-stroke-weak"
																/>
															);
														}
													}
												})}
											</Menu>
										</Popover>
									</MenuTrigger>
								</li>
							);
						}

						case "separator": {
							return (
								<Separator
									key={id}
									className="mx-1 h-full border-l border-stroke-weak"
									elementType="li"
									orientation="vertical"
								/>
							);
						}
					}
				})}
			</ul>
		</nav>
	);
}

interface NavigationMenuItemProps extends MenuItemProps {
	href: string;
}

function NavigationMenuItem(props: Readonly<NavigationMenuItemProps>): ReactNode {
	const { href, onHoverStart } = props;

	const router = useRouter();

	/**
	 * Adds prefetch behavior similar to `next/link`.
	 *
	 * @see https://github.com/vercel/next.js/discussions/73381
	 *
	 * @see https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Link.tsx
	 * @see https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/link/src/useLink.ts
	 */
	function prefetch() {
		router.prefetch(href, { kind: PrefetchKind.AUTO });
	}

	return (
		<MenuItem
			{...props}
			// @ts-expect-error @see https://github.com/adobe/react-spectrum/issues/7453
			onFocus={chain(prefetch, props.onFocus)}
			onHoverStart={chain(prefetch, onHoverStart)}
		/>
	);
}

interface AppNavigationMobileProps {
	label: string;
	menuCloseLabel: string;
	menuOpenLabel: string;
	menuTitleLabel: string;
	navigation: Record<string, NavigationItem>;
}

export function AppNavigationMobile(props: Readonly<AppNavigationMobileProps>): ReactNode {
	const { label, menuCloseLabel, menuOpenLabel, menuTitleLabel, navigation } = props;

	return (
		<DialogTrigger>
			<nav aria-label={label} className="flex items-center py-3 md:hidden">
				<IconButton className="-ml-3" kind="tertiary" label={menuOpenLabel} tone="neutral">
					<MenuIcon aria-hidden={true} data-slot="icon" />
				</IconButton>
			</nav>
			<ModalOverlay
				className="fixed top-0 left-0 isolate z-20 h-(--visual-viewport-height) w-full animate-underlay-in bg-fill-overlay exiting:animate-underlay-out"
				isDismissable={true}
			>
				<Modal className="mr-12 size-full max-h-full max-w-sm bg-background-overlay shadow-overlay forced-colors:bg-[Canvas] entering:animate-slide-left-in exiting:animate-slide-left-out">
					<Dialog className="relative h-full max-h-[inherit] overflow-auto">
						{({ close }) => {
							return (
								<Fragment>
									<header className="p-6">
										<Heading className="sr-only" slot="title">
											{menuTitleLabel}
										</Heading>
										<IconButton
											className="-my-3 -ml-3"
											kind="tertiary"
											label={menuCloseLabel}
											slot="close"
											tone="neutral"
										>
											<XIcon aria-hidden={true} data-slot="icon" />
										</IconButton>
									</header>
									<ul className="text-small" role="list">
										{Object.entries(navigation).map(([id, item]) => {
											switch (item.type) {
												case "link": {
													return (
														<li key={id}>
															<NavLink
																className="interactive inline-flex w-full px-6 py-3 text-text-strong hover:hover-overlay focus-visible:focus-outline focus-visible:-focus-outline-offset-2 aria-[current]:select-overlay-left aria-[current]:hover-overlay pressed:press-overlay"
																href={item.href}
																onPress={() => {
																	/**
																	 * `next/link` does not support pointer events, and `click`
																	 * fires after react aria components' `press` events, therefore
																	 * we delay closing the dialog so the navigation is guaranteed to
																	 * be triggered. practically, this seems only relevant for
																	 * firefox on touch devices.
																	 *
																	 * maybe unnecessary after @see https://github.com/adobe/react-spectrum/pull/7542
																	 */
																	requestAnimationFrame(close);
																}}
															>
																{item.label}
															</NavLink>
														</li>
													);
												}

												case "separator": {
													return (
														<Separator
															key={id}
															className="my-1 w-full border-b border-stroke-weak"
															elementType="li"
														/>
													);
												}

												case "menu": {
													return (
														<li key={id}>
															<Disclosure className="group">
																<Heading>
																	<Button
																		className="interactive inline-flex w-full items-center justify-between px-6 py-3 text-text-strong group-expanded:hover-overlay hover:hover-overlay focus-visible:focus-outline focus-visible:-focus-outline-offset-2 pressed:press-overlay"
																		slot="trigger"
																	>
																		{item.label}
																		<ChevronRightIcon
																			aria-hidden={true}
																			className="size-5 shrink-0"
																		/>
																	</Button>
																</Heading>
																<DisclosurePanel>
																	<ul role="list">
																		{Object.entries(item.children).map(([id, item]) => {
																			switch (item.type) {
																				case "link": {
																					return (
																						<li key={id}>
																							<NavLink
																								className="interactive inline-flex w-full px-6 py-3 text-text-strong hover:hover-overlay focus-visible:focus-outline focus-visible:-focus-outline-offset-2 aria-[current]:select-overlay-left aria-[current]:hover-overlay pressed:press-overlay"
																								href={item.href}
																								onPress={() => {
																									/**
																									 * `next/link` does not support pointer events, and `click`
																									 * fires after react aria components' `press` events, therefore
																									 * we delay closing the dialog so the navigation is guaranteed to
																									 * be triggered. practically, this seems only relevant for
																									 * firefox on touch devices.
																									 *
																									 * maybe unnecessary after @see https://github.com/adobe/react-spectrum/pull/7542
																									 */
																									requestAnimationFrame(close);
																								}}
																							>
																								{item.label}
																							</NavLink>
																						</li>
																					);
																				}

																				case "separator": {
																					return (
																						<Separator
																							key={id}
																							className="my-1 w-full border-b border-stroke-weak"
																							elementType="li"
																						/>
																					);
																				}
																			}
																		})}
																	</ul>
																</DisclosurePanel>
															</Disclosure>
														</li>
													);
												}
											}
										})}
									</ul>
								</Fragment>
							);
						}}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	);
}
