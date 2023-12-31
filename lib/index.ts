#!/usr/bin/env node

import colors from '@colors/colors/safe';
import prompt from 'prompt';
import nunjucks from 'nunjucks';
import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import spawn from 'cross-spawn';
import { sync as commandExistsSync } from 'command-exists';

const templateDir = path.join(__dirname, '..', 'template');

const dottedFilesAndFolders = [
  'babelrc',
  'eslintrc.json',
  'gitignore',
  'prettierrc',
  'husky',
  'vscode',
];

const schema: prompt.Schema = {
  properties: {
    name: {
      description: colors.white('lib name'),
      type: 'string',
      pattern: /^\S+$/,
      message: 'provide a valid name without any empty spaces',
      required: true,
    },
    version: {
      description: colors.white('initial version'),
      type: 'string',
      pattern: /^\d+\.\d+\.\d+$/,
      message: 'provide a valid version',
      default: '0.0.1',
    },
    description: {
      description: colors.white('description'),
      type: 'string',
    },
    repositoryUrl: {
      description: colors.white('git repository url'),
      type: 'string',
      pattern: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
      message: 'provide a valid repository url',
    },
    keywords: {
      description: colors.white(
        'keywords (use comma `,` to separate keywords)'
      ),
      type: 'string',
    },
    author: {
      description: colors.white('author'),
      type: 'string',
    },
    packageManager: {
      description: colors.white('which dependency manager should it use?'),
      type: 'string',
      required: true,
      default: 'npm',
    },
  },
};

prompt.message = '';

prompt.delimiter = colors.white(':');

prompt.start();

console.log(
  colors.white('This utility will walk you through creating a new lib')
);
console.log(
  colors.white(
    'It will ask you some questions and use them to build the boilerplate\n'
  )
);

prompt.get(schema, (err, result) => {
  if (err) throw new Error(err.message);

  if (!commandExistsSync('git'))
    throw new Error(
      `The command git doesn't exist on PATH, install it end try again`
    );

  if (!commandExistsSync(result.packageManager.toString()))
    throw new Error(
      `The command ${result.packageManager} doesn't exist on PATH, install it end try again`
    );

  console.log(colors.white('\nCreating boilerplate...'));

  const projectDir = path.join(process.cwd(), result.name.toString());

  fs.cpSync(templateDir, projectDir, { recursive: true });

  getAllFilesFromDirectory(projectDir).forEach((filePath) => {
    fse.outputFileSync(
      filePath,
      nunjucks.render(filePath, transformResultForRender(result))
    );
  });

  addDotToFilesAndFolders(result.name.toString());

  console.log(colors.white('\nInstalling dependencies...\n'));

  spawn.sync('git', ['init'], {
    stdio: 'ignore',
    cwd: projectDir,
  });

  spawn.sync(result.packageManager.toString(), ['install'], {
    stdio: 'inherit',
    cwd: projectDir,
  });

  spawn.sync('npx', ['husky', 'install'], {
    stdio: 'inherit',
    cwd: projectDir,
  });

  console.log(colors.white(`\nLib created successfully on ${projectDir}.\n`));
});

function addDotToFilesAndFolders(projectDir: string) {
  const files = fs.readdirSync(projectDir);

  files.forEach((fileName) => {
    if (dottedFilesAndFolders.includes(fileName)) {
      fs.renameSync(
        path.join(projectDir, fileName),
        path.join(projectDir, `.${fileName}`)
      );
    }
  });
}

function getAllFilesFromDirectory(currentDirectory: string): string[] {
  const files = fs.readdirSync(currentDirectory);

  const filePaths = files.map((file) => {
    const filePath = path.join(currentDirectory, file);
    const stat = fs.statSync(filePath);
    return stat.isDirectory() ? getAllFilesFromDirectory(filePath) : filePath;
  });

  return Array.prototype.concat(...filePaths);
}

function transformResultForRender<
  T extends Record<string, string | prompt.RevalidatorSchema>,
>(result: T) {
  return {
    ...result,
    keywords: result.keywords
      ? result.keywords
          .toString()
          .split(',')
          .map((keyword) => `"${keyword.trim()}"`)
      : undefined,
    pascalCasedName: result.name
      .toString()
      .split('-')
      .map((w) => w.split('_'))
      .flat()
      .map((w) => (w ? `${w[0].toUpperCase()}${w.slice(1)}` : w))
      .join(''),
  };
}
