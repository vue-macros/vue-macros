# 从 v2 迁移到 v3

## 统一版本管理

最初，我们使用 [`changesets`](https://github.com/changesets/changesets) 来管理 monorepo 中所有包的版本
然而，经过两年的实践，我们决定在 v3 中采用单一版本策略，即所有子包共享相同的版本号，类似于 Vue 和 Babel 的做法。
这一决策源于我们发现，当某个子包进行重大变更或次要更新时，主包的版本号未能充分反映这些变化。

例如，当 `@vue-macros/define-prop` 发生重大变更时，`unplugin-vue-macros` 应如何发布新版本？是发布次要版本还是补丁版本？
用户在更新 `unplugin-vue-macros` 时，也无法直观了解这一更新是否源于 `@vue-macros/define-prop` 的变更。

因此，在 Anthony 提出 [Epoch Semantic Versioning](https://antfu.me/posts/epoch-semver) 后，
我们决定采用更频繁的主版本更新策略，所有包共享相同的版本号，并仅维护一个统一的变更日志。

## 主包名称变更

我们将主包名称从 `unplugin-vue-macros` 更改为 **`vue-macros`**。
v3 正式发布后，`unplugin-vue-macros` 将被标记为已弃用。

因此，您需要更新 `package.json` 和导入 Vue Macros 的语句：

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

## 移除 Vue 2 支持

Vue 2 已于 2023 年底进入终止支持阶段（EOL），因此我们决定在 v3 中移除对 Vue 2 的支持。
如果您仍在使用 Vue 2，建议您继续使用 v2 版本，或考虑我们的[付费支持计划](https://github.com/vue-macros/vue-macros/issues/373)。

## Node.js 兼容性调整

在 v3 中，我们移除了对 Node.js 20.19 以下版本的支持。这意味着 v3 的最低 Node.js 版本要求为 `20.19.0`。
同时，我们移除了 CommonJS（CJS）产物，仅提供 ECMAScript 模块（ESM）。

## 移除 Webpack 4 支持

由于 Webpack 4 无法在 Node.js 18 及以上环境中运行，我们移除了对 Webpack 4 和 Vue CLI 4 的支持。
建议您升级至 Vite 或 Rspack 等现代构建工具。
