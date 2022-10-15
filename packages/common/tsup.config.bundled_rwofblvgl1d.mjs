// tsup.config.ts
import { defineConfig } from "tsup";
var tsup_config_default = defineConfig({
  entry: ["./src/*.ts"],
  format: ["cjs", "esm"],
  target: "node14",
  splitting: true,
  watch: !!process.env.DEV,
  dts: process.env.DEV ? false : {
    compilerOptions: {
      paths: {}
    }
  },
  tsconfig: "../../tsconfig.lib.json",
  clean: true
});
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3RzdXAnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGVudHJ5OiBbJy4vc3JjLyoudHMnXSxcbiAgZm9ybWF0OiBbJ2NqcycsICdlc20nXSxcbiAgdGFyZ2V0OiAnbm9kZTE0JyxcbiAgc3BsaXR0aW5nOiB0cnVlLFxuICB3YXRjaDogISFwcm9jZXNzLmVudi5ERVYsXG4gIGR0czogcHJvY2Vzcy5lbnYuREVWXG4gICAgPyBmYWxzZVxuICAgIDoge1xuICAgICAgICBjb21waWxlck9wdGlvbnM6IHtcbiAgICAgICAgICBwYXRoczoge30sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICB0c2NvbmZpZzogJy4uLy4uL3RzY29uZmlnLmxpYi5qc29uJyxcbiAgY2xlYW46IHRydWUsXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBLFNBQVMsb0JBQW9CO0FBRTdCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE9BQU8sQ0FBQyxZQUFZO0FBQUEsRUFDcEIsUUFBUSxDQUFDLE9BQU8sS0FBSztBQUFBLEVBQ3JCLFFBQVE7QUFBQSxFQUNSLFdBQVc7QUFBQSxFQUNYLE9BQU8sQ0FBQyxDQUFDLFFBQVEsSUFBSTtBQUFBLEVBQ3JCLEtBQUssUUFBUSxJQUFJLE1BQ2IsUUFDQTtBQUFBLElBQ0UsaUJBQWlCO0FBQUEsTUFDZixPQUFPLENBQUM7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBQ0osVUFBVTtBQUFBLEVBQ1YsT0FBTztBQUNULENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
