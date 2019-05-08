/* eslint no-console:0 */
require('colors');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const merge = require('lodash.merge');
const { read } = require('properties-parser');

const javaStringToLocaleMessageFormat = string => {
	let counter = -1;
	return string.replace(/%([a-z])/g, (match, p1) => {
		counter += 1;
		return `%{${p1}${counter}}`;
	});
};

const stringWithDotsProcess = ({
	initialObj,
	initialKey,
	value,
	keysLeft,
	objLink,
	localeName,
}) => {
	const curKey = keysLeft.shift();
	if (!keysLeft.length) {
		delete initialObj[initialKey];
		try {
			objLink[curKey] = value;
		} catch (error) {
			error.message = `Error during parsing ${localeName}.${initialKey}: can't read '${curKey}' field of undefined`;
			throw error;
		}
		return;
	}
	objLink[curKey] = objLink[curKey] || {};
	stringWithDotsProcess({
		initialObj,
		initialKey,
		value,
		keysLeft,
		objLink: objLink[curKey],
		localeName,
	});
};

const parseAccessibleLocales = src => {
	const ignoreList = ['.DS_Store'];
	const locales = [];
	fs.readdirSync(src).forEach(itemName => {
		if (ignoreList.indexOf(itemName) === -1) {
			if (fs.statSync(`${src}/${itemName}`).isDirectory()) {
				locales.push(itemName);
			}
		}
	});
	return locales;
};

const dots2keys = (obj, localeName) => {
	Object.keys(obj).forEach(key => {
		if (key.indexOf('.') === -1) return;
		const value = javaStringToLocaleMessageFormat(obj[key]);
		stringWithDotsProcess({
			initialObj: obj,
			initialKey: key,
			value,
			keysLeft: key.split('.'),
			objLink: obj,
			localeName,
		});
	});
};

const parseLocaleFromDir = ({ localeName, langDir, flatten }) => {
	const localeObject = glob
		.sync('*.properties', { cwd: path.join(langDir, localeName), realpath: true })
		.reduce((acc, propertiesFilename) => {
			const namespace = /([^/\\]+).properties$/.exec(propertiesFilename)[1]; // extract filename without extension
			const objectOfLocalizedMessages = read(propertiesFilename);
			if (flatten) {
				Object.keys(objectOfLocalizedMessages).forEach(key => {
					acc[`${namespace}.${key}`] = objectOfLocalizedMessages[key];
				});
			} else {
				dots2keys(objectOfLocalizedMessages, localeName);
				acc[namespace] = objectOfLocalizedMessages;
			}
			return acc;
		}, {});
	return localeObject;
};

const props2Json = argv => {
	const { src: langDir, dist: destinationDir, default: defaultLocale, flatten } = argv;
	// console.log('Start parsing locales props files to Json');
	const locales = parseAccessibleLocales(langDir);
	if (!locales.length) return;

	// Delete old .json files
	glob.sync('*', { cwd: destinationDir }).forEach(localeName => {
		fs.unlinkSync(path.join(destinationDir, localeName));
	});

	const defaultLocaleObj = parseLocaleFromDir({ localeName: defaultLocale, langDir, flatten });

	// Generated needed locales
	locales.forEach(localeName => {
		// console.log(`Start parsing locale: ${localeName}`);
		const localeObject = parseLocaleFromDir({ localeName, langDir, flatten });
		const localeObjectWithDefaultsApplied = merge({}, defaultLocaleObj, localeObject);
		const destFile = path.join(destinationDir, `${localeName}.json`);
		const destContent = JSON.stringify(localeObjectWithDefaultsApplied, null, 4);
		fs.writeFileSync(destFile, destContent, 'utf-8');
		console.log(`${localeName} locale file was successfully written`.green);
	});

	console.info('All the localization files prepared. OK.'.green);
};

module.exports = props2Json;
