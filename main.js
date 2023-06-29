#!/usr/bin/env node

const colors = require("@colors/colors/safe");
const prompt = require("prompt");
const nunjucks = require("nunjucks");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const spawn = require("cross-spawn");

const templateDir = path.join(__dirname, "template");

const dottedFilesAndFolders = [
  "babelrc",
  "eslintrc.json",
  "gitignore",
  "prettierrc",
  "husky",
  "vscode",
];

const schema = {
  properties: {
    name: {
      description: colors.white("lib name"),
      type: "string",
      pattern: /^\S+$/,
      message: "lib name cannot contain whitespaces or be empty",
      required: true,
    },
    version: {
      description: colors.white("initial version"),
      type: "string",
      pattern: /^\d+\.\d+\.\d+$/,
      message: "enter a valid version",
      default: "0.0.1",
    },
    description: {
      description: colors.white("description"),
      type: "string",
    },
    repositoryUrl: {
      description: colors.white("git repository url"),
      type: "string",
      pattern: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
      message: "enter a valid repository url",
    },
    keywords: {
      description: colors.white("keywords"),
      type: "string",
    },
    author: {
      description: colors.white("author"),
      type: "string",
    },
  },
};

prompt.message = "";

prompt.delimiter = colors.white(":");

prompt.start();

console.log(
  colors.white("This utility will walk you through creating a new lib")
);
console.log(
  colors.white(
    "It will ask you some questions and use them to build the boilerplate\n"
  )
);

prompt.get(schema, (err, result) => {
  if (err) throw new Error(err);

  console.log(colors.white("\nCreating boilerplate..."));

  const projectDir = path.join(process.cwd(), result.name);

  fs.cpSync(templateDir, projectDir, { recursive: true });

  getAllFilesFromDirectory(projectDir).forEach((filePath) => {
    fse.outputFileSync(
      filePath,
      nunjucks.render(filePath, transformResultForRender(result))
    );
  });

  addDotToFilesAndFolders(result.name);

  console.log(colors.white("\nInstalling dependencies...\n"));

  spawn.sync("git", ["init"], {
    stdio: "ignore",
    cwd: projectDir,
  });

  spawn.sync("npm", ["install"], {
    stdio: "inherit",
    cwd: projectDir,
  });

  console.log(colors.white(`\nLib created successfully on ${projectDir}.\n`));
});

function addDotToFilesAndFolders(projectDir) {
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

function getAllFilesFromDirectory(currentDirectory) {
  const files = fs.readdirSync(currentDirectory);

  const filePaths = files.map((file) => {
    const filePath = path.join(currentDirectory, file);
    const stat = fs.statSync(filePath);
    return stat.isDirectory() ? getAllFilesFromDirectory(filePath) : filePath;
  });

  return Array.prototype.concat(...filePaths);
}

function transformResultForRender(result) {
  return {
    ...result,
    keywords: result.keywords
      ? result.keywords.split(",").map((keyword) => `"${keyword.trim()}"`)
      : undefined,
    pascalCasedName: result.name
      .split("-")
      .map((w) => w.split("_"))
      .flat()
      .map((w) => (w ? `${w[0].toUpperCase()}${w.slice(1)}` : w))
      .join(""),
  };
}
