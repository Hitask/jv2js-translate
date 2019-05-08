# java2js-translate-tools

Tools for converting translations from java properties to JSON format.
Example:

Source file `en/main.properties`
```java
login.password=Password
```
will be compiled to `en.json`
```json
"main": {
	"login": {
		"password": "Password"
	}
}
```

### API

##### Executable name: `jv2js-translate`

##### Command `compile`

Options:
* src, s - relative or absolute path to folder with source locales directories. That folder should contain directories with `.properties` files. Folder name should math language name. Folder should exist. Required option
* dist, d - relative or absolute path to folder where compiled files will be placed. Folder should exist. Required option
* default, f - default locale (must match one of locales folders name). Default value: `en`

Example: `jv2js-translate compile -s ./languages -d ./public/app/json-locales`
