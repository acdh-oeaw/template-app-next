import type { ReactNode } from "react";

export const dataAttribute = "uiColorScheme";
export const storageKey = "ui-color-scheme";

export function ColorSchemeScript(): ReactNode {
	return (
		<script
			dangerouslySetInnerHTML={{
				__html: `document.documentElement.dataset.${dataAttribute}=function(){try{let e=window.localStorage.getItem("${storageKey}");if("dark"===e||"light"===e)return e}catch{}return window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"}();`,
			}}
			defer={true}
			id="color-scheme-script"
		/>
	);
}
