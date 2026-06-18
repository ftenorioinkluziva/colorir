import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/**/*.ts"],
			exclude: ["src/**/*.test.ts", "src/**/*.spec.ts"],
		},
	},
	resolve: {
		alias: {
			"@colorir/db": resolve(__dirname, "../db/src"),
			"@colorir/auth": resolve(__dirname, "../auth/src"),
			"@colorir/env": resolve(__dirname, "../env/src"),
			"@colorir/ui": resolve(__dirname, "../ui/src"),
			"@colorir/config": resolve(__dirname, "../config"),
		},
	},
});
