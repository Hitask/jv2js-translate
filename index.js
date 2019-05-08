const fs = require('fs');
const compileProps2Json = require('./compileProps2Json');
const { checkRelativePathArgs, checkFolderExists } = require('./helpers');

const compileLocales = arg => {
	const defaultArgs = { default: 'en', flatten: false };
	const args = checkRelativePathArgs({ ...defaultArgs, ...arg }, ['src', 's', 'dist', 'd']);
	if (!checkFolderExists(args.src)) throw new Error(`Folder ${args.src} does not exist`);
	if (!checkFolderExists(args.dist)) fs.mkdirSync(args.dist, { recursive: true });
	return compileProps2Json(args);
};

module.exports = { compileLocales };
