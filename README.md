# Create JS lib ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-green.svg)

Create a new JS lib with no build configuration.

## Usage

Just run a `npx @andersonsmed/create-js-lib@latest` command in your terminal and answer the prompted questions.

After that, this script will create a new lib with all the configs so you can focus only on implementing the code.

If something doesn’t work, please [file an issue](https://github.com/AndersonSMed/create-js-lib/issues/new)

If you have questions or need help, please ask in [GitHub Discussions](https://github.com/AndersonSMed/create-js-lib/discussions).
## What’s Included?

The nearly created lib will have everything you need to build and publish it, including:

- ES6 and CommonJS support, so you can choose which one to follow while writing your code.
- Babel as transpiler, so you don't have to care about making your lib compatible with older versions of JS.
- Webpack as bundler, so you can publish the minified version of your lib.
- Husky for managing and installing git hooks.
- ESLint and Prettier to enable static code validation and enforce code style.
- A build script to prepare your code to be published.
- A development script to enable you to test your lib locally.

All of the configuration files contains only the essentials for your lib to be published, so you can extend them easily to fit your own needs. 

## External Dependencies

Create JS lib depends on some external commands and might fail if they are not accessible from the terminal.

Following is a list with all the external dependencies with guides on how to install each one of them:

- GIT - https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
- NPM (if you choose to install packages using npm) - https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- YARN (if you choose to install packages using yarn) - https://classic.yarnpkg.com/lang/en/docs/install/

## License

Create JS lib is open source software [licensed as MIT](https://github.com/AndersonSMed/create-js-lib/blob/main/LICENSE).