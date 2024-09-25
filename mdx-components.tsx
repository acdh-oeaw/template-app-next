import { Disclosure } from "@/components/disclosure";
import { Embed } from "@/components/embed";
import { Figure } from "@/components/figure";
import { Grid, GridItem } from "@/components/grid";
import { Image } from "@/components/image";
import { Link } from "@/components/link";
import { ResourceLink } from "@/components/resource-link";
import { Tab, Tabs } from "@/components/tabs";
import { Tweet } from "@/components/tweet";
import { Video } from "@/components/video";

const components = {
	a: Link,
	Disclosure,
	Embed,
	Figure,
	Grid,
	GridItem,
	img: Image,
	Link: ResourceLink,
	Tab,
	Tabs,
	Tweet,
	Video,
};

declare global {
	type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
	return components;
}
