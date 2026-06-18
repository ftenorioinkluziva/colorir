const {
	generateStoryIndex,
} = require("../development/scripts/story-index-generator.js");

if (require.main === module) {
	const storiesDir = process.argv[2] || "docs/stories";
	const outputPath = process.argv[3] || null;

	generateStoryIndex(storiesDir, outputPath)
		.then((result) => {
			console.log("\n📊 Generation Complete!");
			console.log(`Total Stories: ${result.totalStories}`);
			console.log(`Output: ${result.outputPath}`);
			process.exit(0);
		})
		.catch((error) => {
			console.error("❌ Generation failed:", error);
			process.exit(1);
		});
}

module.exports = {
	...require("../development/scripts/story-index-generator.js"),
};
