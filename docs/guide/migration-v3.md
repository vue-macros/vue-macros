# Migration from v2 to v3

## Unified Version Management

Initially, we used [`changesets`](https://github.com/changesets/changesets) to
manage the versions of all packages in the monorepo. However, after two years of experimentation,
we decided to adopt a single-version strategy in v3,
where all sub-packages share the same version number, similar to Vue and Babel.
This decision stemmed from our observation that when a sub-package underwent a major change or minor update,
the version number of the main package did not adequately reflect these changes.

For example, when `@vue-macros/define-prop` introduced a breaking change,
how should `unplugin-vue-macros` release a new version?
Should it be a minor or a patch release? When users updated `unplugin-vue-macros`,
they couldn’t easily determine whether the update was due to changes in `@vue-macros/define-prop`.

Therefore, after Anthony proposed [Epoch Semantic Versioning](https://antfu.me/posts/epoch-semver),
we decided to adopt a more frequent major version update strategy,
with all packages sharing the same version number and maintaining a single unified changelog.

## Main Package Rename

We have renamed the main package from `unplugin-vue-macros` to **`vue-macros`**.
After the official release of v3, `unplugin-vue-macros` will be marked as deprecated.

As a result, you will need to update your `package.json` and the import statements for Vue Macros:

```diff
 // package.json
 {
   "devDependencies": {
-    "unplugin-vue-macros": "^2.14.5"
+    "vue-macros": "^3.0.0"
   }
 }
```

```diff
- import { $ref } from 'unplugin-vue-macros/macros'
+ import { $ref } from 'vue-macros/macros'

- import VueMacros from 'unplugin-vue-macros/vite'
+ import VueMacros from 'vue-macros/vite'
```

## Dropping Vue 2 Support

Vue 2 reached its end of life (EOL) at the end of 2023, so we have decided to drop support for Vue 2 in v3.
If you are still using Vue 2, we recommend continuing with v2 or
considering our [paid support plan](https://github.com/vue-macros/vue-macros/issues/373).

## Node.js Compatibility Changes

In v3, we have dropped support for Node.js versions below 20.18.
This means the minimum Node.js version requirement for v3 is `20.18.0`.
Additionally, we have removed CommonJS (CJS) outputs and now only provide ECMAScript modules (ESM).

## Dropping Webpack 4 Support

Since Webpack 4 cannot run in Node.js 18 or later environments,
we have also dropped support for Webpack 4 and Vue CLI 4.
We recommend upgrading to modern build tools like Vite or Rspack.
