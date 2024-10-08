import { access, symlink } from 'fs/promises';
import { join } from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack(config, { isServer, dev }) {
		// Use the client static directory in the server bundle and prod mode
		// Fixes `Error occurred prerendering page "/"`
		// config.output.webassemblyModuleFilename =
		// 	isServer && !dev ? '../static/pkg/[modulehash].wasm' : 'static/pkg/[modulehash].wasm';
		config.experiments = { ...config.experiments, asyncWebAssembly: true };
		if (!dev) {
			config.plugins.push(
				new (class {
					apply(compiler) {
						compiler.hooks.afterEmit.tapPromise('SymlinkWebpackPlugin', async (compiler) => {
							if (isServer) {
								const from = join(compiler.options.output.path, '../static');
								const to = join(compiler.options.output.path, 'static');

								try {
									await access(from);
									console.log(`${from} already exists`);
									return;
								} catch (error) {
									if (error.code === 'ENOENT') {
										// No link exists
									} else {
										throw error;
									}
								}

								await symlink(to, from, 'junction');
								console.log(`created symlink ${from} -> ${to}`);
							}
						});
					}
				})(),
			);
			// NOTE: need to handle "Edge as a separate case"
			/*
			type WebpackConfigContext = {
			dev: boolean;
			isServer: boolean;
				nextRuntime?: 'nodejs' | 'edge';
			}
				*/
			// https://github.com/vercel/next.js/issues/25852
			if (isServer) {
				config.output.webassemblyModuleFilename = './../static/wasm/[modulehash].wasm';
			} else {
				config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
			}
		}

		return config;
	},
	experimental: {
		optimizePackageImports: ['web-worker'],
	},
	swcMinify: false,
	// transpilePackages: ['web-worker'],
};

export default nextConfig;
