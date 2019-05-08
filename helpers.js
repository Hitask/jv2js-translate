const fs = require('fs');
const path = require('path');

const checkRelativePath = pathStr => {
	const cwd = process.cwd();
	if (pathStr[0] === '.') return path.join(cwd, pathStr); // convert relative path
	return pathStr;
};

const checkRelativePathArgs = (argv, options = []) => {
	options.forEach(option => {
		if (argv[option]) argv[option] = checkRelativePath(argv[option]);
	});
	return argv;
};

const checkFolderExists = pathStr => fs.existsSync(pathStr) && fs.statSync(pathStr).isDirectory();

module.exports = {
	checkRelativePath,
	checkRelativePathArgs,
	checkFolderExists,
};
