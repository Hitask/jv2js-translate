const path = require('path');
const { compileLocales } = require('../index');

const options = {
	src: path.join(__dirname, 'src'),
	dist: path.join(__dirname, 'dist'),
	flatten: true,
};

compileLocales(options);
