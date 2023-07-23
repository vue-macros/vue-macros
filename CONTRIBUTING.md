# Contribution Guide

Please refer to https://github.com/sxzz/contribute for more details.

## Introduction

First, thank you for contributing to Vue Macros!

We welcome any type of contribution, not only code. You can help with:

- **QA**: You can [open an issue](https://github.com/sxzz/vue-macros/issues) for bug reports, the more details you can give the better - links or repos that demonstrate the specific issue. Even if you can't write code, commenting on them, and showing that you care about a given issue matters. It helps us triage them.
- **Sponsors**: We welcome financial contributions.

## Your First Contribution

Working on your first pull request? you can learn how from this _free_ course, [How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github).

## How to Run and test on Your Local Machine

First `pnpm install`, you have to install all the dependencies.

The project is based on TypeScript 5, you have to check your compiler version before you run and test. If you're using VSCode, you should check the compiler version and select the version following the tutorial [here](https://stackoverflow.com/questions/39668731/what-typescript-version-is-visual-studio-code-using-how-to-update-it#answer-39676463).

Then you can run `pnpm dev` to run the project in development mode.

With `pnpm  test` you can run all tests, if you want to run some specific package tests only, you can run with `pnpm test packages/<package-name>`. More scripts are in `package.json` file.

## Submitting code

Any code change should be submitted as a pull request. The description should explain what the code does and give steps to execute it. The pull request should also contain tests.
