import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			manifest: {
				name: 'FlowDo',
				short_name: 'FlowDo',
				description: 'All-in-One To-Do List & Habit Tracker',
				theme_color: '#1e1e42',
				background_color: '#0f0f1a',
				display: 'standalone',
				icons: [
					{
						src: 'favicon.svg',
						sizes: '192x192',
						type: 'image/svg+xml'
					},
					{
						src: 'favicon.svg',
						sizes: '512x512',
						type: 'image/svg+xml'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
				runtimeCaching: [
					{
						urlPattern: /^\/api\//,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							networkTimeoutSeconds: 5,
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 // 1 hari
							}
						}
					}
				]
			}
		})
	]
});
