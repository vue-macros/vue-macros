// ../../tsup.config.ts
import { readFile } from "node:fs/promises";
import { defineConfig } from "tsup";
var rawRE = /[&?]raw(?:&|$)/;
var tsup_config_default = defineConfig({
  entry: ["./src/*.ts"],
  format: ["cjs", "esm"],
  target: "node14",
  splitting: true,
  watch: !!process.env.DEV,
  dts: process.env.DEV ? false : {
    compilerOptions: {
      composite: false,
      customConditions: ["dev"]
    }
  },
  tsconfig: "../../tsconfig.lib.json",
  clean: true,
  define: {
    "import.meta.DEV": JSON.stringify(!!process.env.DEV)
  },
  esbuildOptions: (options) => {
    options.conditions = ["dev"];
  },
  esbuildPlugins: [
    {
      name: "raw-plugin",
      setup(build) {
        build.onLoad({ filter: /.*/ }, async ({ path, suffix }) => {
          if (!rawRE.test(suffix))
            return;
          return {
            contents: `export default ${JSON.stringify(
              await readFile(path, "utf-8")
            )}`
          };
        });
      }
    }
  ]
});
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vdHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL2hvbWUvaGVucnlxdWUvcHJvamVjdHMvdW5wbHVnaW4tdnVlLW1hY3Jvcy90c3VwLmNvbmZpZy50c1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCIvaG9tZS9oZW5yeXF1ZS9wcm9qZWN0cy91bnBsdWdpbi12dWUtbWFjcm9zXCI7Y29uc3QgX19pbmplY3RlZF9pbXBvcnRfbWV0YV91cmxfXyA9IFwiZmlsZTovLy9ob21lL2hlbnJ5cXVlL3Byb2plY3RzL3VucGx1Z2luLXZ1ZS1tYWNyb3MvdHN1cC5jb25maWcudHNcIjtpbXBvcnQgeyByZWFkRmlsZSB9IGZyb20gJ25vZGU6ZnMvcHJvbWlzZXMnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd0c3VwJ1xuXG5jb25zdCByYXdSRSA9IC9bJj9dcmF3KD86JnwkKS9cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgZW50cnk6IFsnLi9zcmMvKi50cyddLFxuICBmb3JtYXQ6IFsnY2pzJywgJ2VzbSddLFxuICB0YXJnZXQ6ICdub2RlMTQnLFxuICBzcGxpdHRpbmc6IHRydWUsXG4gIHdhdGNoOiAhIXByb2Nlc3MuZW52LkRFVixcbiAgZHRzOiBwcm9jZXNzLmVudi5ERVZcbiAgICA/IGZhbHNlXG4gICAgOiB7XG4gICAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICAgIGNvbXBvc2l0ZTogZmFsc2UsXG4gICAgICAgICAgY3VzdG9tQ29uZGl0aW9uczogWydkZXYnXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gIHRzY29uZmlnOiAnLi4vLi4vdHNjb25maWcubGliLmpzb24nLFxuICBjbGVhbjogdHJ1ZSxcbiAgZGVmaW5lOiB7XG4gICAgJ2ltcG9ydC5tZXRhLkRFVic6IEpTT04uc3RyaW5naWZ5KCEhcHJvY2Vzcy5lbnYuREVWKSxcbiAgfSxcbiAgZXNidWlsZE9wdGlvbnM6IChvcHRpb25zKSA9PiB7XG4gICAgb3B0aW9ucy5jb25kaXRpb25zID0gWydkZXYnXVxuICB9LFxuICBlc2J1aWxkUGx1Z2luczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdyYXctcGx1Z2luJyxcbiAgICAgIHNldHVwKGJ1aWxkKSB7XG4gICAgICAgIGJ1aWxkLm9uTG9hZCh7IGZpbHRlcjogLy4qLyB9LCBhc3luYyAoeyBwYXRoLCBzdWZmaXggfSkgPT4ge1xuICAgICAgICAgIGlmICghcmF3UkUudGVzdChzdWZmaXgpKSByZXR1cm5cbiAgICAgICAgICAvLyByYXcgcXVlcnksIHJlYWQgZmlsZSBhbmQgcmV0dXJuIGFzIHN0cmluZ1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb250ZW50czogYGV4cG9ydCBkZWZhdWx0ICR7SlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICAgIGF3YWl0IHJlYWRGaWxlKHBhdGgsICd1dGYtOCcpXG4gICAgICAgICAgICApfWAsXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICB9LFxuICBdLFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1EsU0FBUyxnQkFBZ0I7QUFDeFMsU0FBUyxvQkFBb0I7QUFFN0IsSUFBTSxRQUFRO0FBRWQsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTyxDQUFDLFlBQVk7QUFBQSxFQUNwQixRQUFRLENBQUMsT0FBTyxLQUFLO0FBQUEsRUFDckIsUUFBUTtBQUFBLEVBQ1IsV0FBVztBQUFBLEVBQ1gsT0FBTyxDQUFDLENBQUMsUUFBUSxJQUFJO0FBQUEsRUFDckIsS0FBSyxRQUFRLElBQUksTUFDYixRQUNBO0FBQUEsSUFDRSxpQkFBaUI7QUFBQSxNQUNmLFdBQVc7QUFBQSxNQUNYLGtCQUFrQixDQUFDLEtBQUs7QUFBQSxJQUMxQjtBQUFBLEVBQ0Y7QUFBQSxFQUNKLFVBQVU7QUFBQSxFQUNWLE9BQU87QUFBQSxFQUNQLFFBQVE7QUFBQSxJQUNOLG1CQUFtQixLQUFLLFVBQVUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxHQUFHO0FBQUEsRUFDckQ7QUFBQSxFQUNBLGdCQUFnQixDQUFDLFlBQVk7QUFDM0IsWUFBUSxhQUFhLENBQUMsS0FBSztBQUFBLEVBQzdCO0FBQUEsRUFDQSxnQkFBZ0I7QUFBQSxJQUNkO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixNQUFNLE9BQU87QUFDWCxjQUFNLE9BQU8sRUFBRSxRQUFRLEtBQUssR0FBRyxPQUFPLEVBQUUsTUFBTSxPQUFPLE1BQU07QUFDekQsY0FBSSxDQUFDLE1BQU0sS0FBSyxNQUFNO0FBQUc7QUFFekIsaUJBQU87QUFBQSxZQUNMLFVBQVUsa0JBQWtCLEtBQUs7QUFBQSxjQUMvQixNQUFNLFNBQVMsTUFBTSxPQUFPO0FBQUEsWUFDOUI7QUFBQSxVQUNGO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
