import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const NoWarns = new Set([
	"a11y-click-events-have-key-events",
	"a11y-no-static-element-interactions",
	"a11y-no-noninteractive-element-interactions"
]);

const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	onwarn: (warning, handler) => {
		// suppress warnings on `vite dev` and `vite build`; but even without this, things still work
		if (NoWarns.has(warning.code)) return;
		handler(warning);
	}
};

export default config;
