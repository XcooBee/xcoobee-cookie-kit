# Contributing to the XcooBee Cookie Kit Project

The XcooBee Cookie Kit project is maintained as a monorepo with several NPM
packages. Lerna is used with this monorepo.


## Project Setup

After cloning the repo, run the following.

```sh
yarn --no-lockfile
```

This will only install the dependencies needed to manage/maintain this monorepo.
For example, it will locally install Lerna.

Then run the following to install all the dependencies of the packages.

```sh
npx lerna bootstrap -- --no-lockfile
```

Note: This command takes several minutes to run. It may appear to hang during
the "Installing external dependencies" step.


## Summary of Using Lerna

See https://github.com/lerna/lerna for more info.

**Installing Dependencies**

To install the dependencies of this project's packages, use

```sh
npx lerna bootstrap -- --no-lockfile
```

In addition to running `yarn`, Lerna also links together each package.

**Adding New Dependencies**

```sh
# Add a package as a dependency for all packages:
npx lerna add <package>

# Add a package as a dependency for packages matching `glob`:
npx lerna add <package> --scope <glob>

# Add a package as a devDependency for packages matching `glob`:
npx lerna add <package> --scope <glob> --dev
```

The `lerna add` command is similar to `npm install` or `yarn add`. However, it
will maintain the links between the packages of this monorepo.

**Running an NPM Script**

```sh
npx lerna run <script>
npx lerna run <script> --scope <glob>
```

**Building All Packages**

```sh
npx lerna run build
```

**Run All Package Tests**

```sh
npx lerna run test
```

**Remove `node_modules` Sub-Directories from All Packages**

```sh
lerna clean
```

See https://github.com/lerna/lerna/tree/master/commands/clean for more options.

**Publishing**

```sh
npx lerna publish
```

See https://github.com/lerna/lerna/tree/master/commands/publish for more
details.

**Add a New Package**

```sh
npx lerna create <name>
npx lerna create <name> --yes
```
