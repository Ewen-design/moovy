import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		allowedHosts: ['moovy.agence3terres.fr']
	},
	preview: {
		allowedHosts: ['moovy.agence3terres.fr']
	},
	plugins: [sveltekit()]
});
