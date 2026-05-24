import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		port: 5175,
		strictPort: true,
		allowedHosts: ['moovy.agence3terres.fr']
	},
	preview: {
		port: 5175,
		strictPort: true,
		allowedHosts: ['moovy.agence3terres.fr']
	},
	plugins: [sveltekit()]
});
