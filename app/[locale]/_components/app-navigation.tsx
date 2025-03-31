"use client";

import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import { type ComponentPropsWithRef, Fragment, type ReactNode } from "react";
import { chain } from "react-aria";
import { Button, Disclosure, DisclosurePanel, Heading } from "react-aria-components";

import { Logo } from "@/components/logo";
import { NavLink } from "@/components/nav-link";
import { Drawer, DrawerTrigger, Modal, ModalOverlay } from "@/components/ui/drawer";
import { IconButton } from "@/components/ui/icon-button";
import { Menu, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { Popover } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
	type NavigationItem,
	type NavigationLink,
	usePathname,
	useRouter,
} from "@/lib/navigation/navigation";
import { isCurrentPage } from "@/lib/navigation/use-nav-link";

interface AppNavigationProps {
	label: string;
	navigation: Record<string, NavigationItem> & { home: NavigationLink };
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
						case "action": {
							return (
								<li key={id}>
									<Button
										className="interactive inline-flex px-4 py-6 text-text-strong hover:hover-overlay focus-visible:focus-outline pressed:press-overlay"
										onPress={item.onAction}
									>
										{item.label}
									</Button>
								</li>
							);
						}

						case "link": {
							return (
								<li key={id}>
									<NavLink
										className="interactive inline-flex px-4 py-6 text-text-strong hover:hover-overlay focus-visible:focus-outline pressed:press-overlay aria-current-page:select-overlay-bottom"
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
										<Button className="group interactive inline-flex items-center gap-x-2 px-4 py-6 text-text-strong hover:hover-overlay focus-visible:focus-outline pressed:press-overlay">
											{item.label}
											<ChevronDownIcon
												aria-hidden={true}
												className="size-6 shrink-0 text-icon-neutral transition group-aria-expanded:rotate-180"
												data-slot="icon"
											/>
										</Button>
										<Popover placement="bottom left">
											<Menu className="min-w-70" selectedKeys={selectedKeys} selectionMode="single">
												{Object.entries(item.children).map(([id, item]) => {
													switch (item.type) {
														case "action": {
															return (
																<MenuItem
																	key={id}
																	id={id}
																	onAction={item.onAction}
																	textValue={item.label}
																>
																	{item.label}
																</MenuItem>
															);
														}

														case "link": {
															return (
																<MenuLink key={id} href={item.href} id={id} textValue={item.label}>
																	{item.label}
																</MenuLink>
															);
														}

														case "separator": {
															return <Separator key={id} className="my-1" id={id} />;
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
								<Separator key={id} className="mx-1" elementType="li" orientation="vertical" />
							);
						}
					}
				})}
			</ul>
		</nav>
	);
}

interface MenuLinkProps extends ComponentPropsWithRef<typeof MenuItem> {
	href: string;
}

function MenuLink(props: Readonly<MenuLinkProps>): ReactNode {
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
	drawerCloseLabel: string;
	drawerLabel: string;
	drawerOpenLabel: string;
	label: string;
	navigation: Record<string, NavigationItem> & { home: NavigationLink };
}

export function AppNavigationMobile(props: Readonly<AppNavigationMobileProps>): ReactNode {
	const { drawerCloseLabel, drawerLabel, drawerOpenLabel, label, navigation } = props;

	return (
		<DrawerTrigger>
			<nav aria-label={label} className="flex items-center py-3 md:hidden">
				<IconButton className="-ml-3" kind="tertiary" label={drawerOpenLabel} tone="neutral">
					<MenuIcon aria-hidden={true} data-slot="icon" />
				</IconButton>
			</nav>
			<ModalOverlay isDismissable={true}>
				<Modal placement="left">
					<Drawer>
						{({ close: _close }) => {
							function close() {
								/**
								 * `next/link` does not support pointer events, and `click`
								 * fires after react aria components' `press` events, therefore
								 * we delay closing the dialog so the navigation is guaranteed to
								 * be triggered. practically, this seems only relevant for
								 * firefox on touch devices.
								 *
								 * maybe unnecessary after @see https://github.com/adobe/react-spectrum/pull/7542
								 */
								requestAnimationFrame(_close);
							}

							return (
								<Fragment>
									<header className="p-6">
										<Heading className="sr-only" slot="title">
											{drawerLabel}
										</Heading>
										<IconButton
											className="-my-3 -ml-3"
											kind="tertiary"
											label={drawerCloseLabel}
											slot="close"
											tone="neutral"
										>
											<XIcon aria-hidden={true} data-slot="icon" />
										</IconButton>
									</header>
									<ul className="text-small" role="list">
										{Object.entries(navigation).map(([id, item]) => {
											switch (item.type) {
												case "action": {
													return (
														<li key={id}>
															<Button
																className="interactive inline-flex w-full px-6 py-3 text-text-strong hover:hover-overlay focus-visible:focus-outline focus-visible:-focus-outline-offset-2 pressed:press-overlay"
																onPress={chain(close, item.onAction)}
															>
																{item.label}
															</Button>
														</li>
													);
												}

												case "link": {
													return (
														<li key={id}>
															<NavLink
																className="interactive inline-flex w-full px-6 py-3 text-text-strong hover:hover-overlay focus-visible:focus-outline focus-visible:-focus-outline-offset-2 pressed:press-overlay aria-current-page:select-overlay-left aria-current-page:hover-overlay"
																href={item.href}
																onPress={close}
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
																		<ChevronDownIcon
																			aria-hidden={true}
																			className="size-6 shrink-0 text-icon-neutral transition group-expanded:rotate-180"
																			data-slot="icon"
																		/>
																	</Button>
																</Heading>
																<DisclosurePanel>
																	<ul role="list">
																		{Object.entries(item.children).map(([id, item]) => {
																			switch (item.type) {
																				case "action": {
																					return (
																						<li key={id}>
																							<Button
																								className="interactive inline-flex w-full px-6 py-3 text-text-strong hover:hover-overlay focus-visible:focus-outline focus-visible:-focus-outline-offset-2 pressed:press-overlay"
																								onPress={chain(close, item.onAction)}
																							>
																								{item.label}
																							</Button>
																						</li>
																					);
																				}

																				case "link": {
																					return (
																						<li key={id}>
																							<NavLink
																								className="interactive inline-flex w-full px-6 py-3 text-text-strong hover:hover-overlay focus-visible:focus-outline focus-visible:-focus-outline-offset-2 pressed:press-overlay aria-current-page:select-overlay-left aria-current-page:bg-fill-brand-weak"
																								href={item.href}
																								onPress={close}
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
					</Drawer>
				</Modal>
			</ModalOverlay>
		</DrawerTrigger>
	);
}
