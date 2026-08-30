import { defineConfig } from 'drizzle-kit';

// 告诉数据库工具：表结构在哪里，以及生成的 SQLite 迁移文件放在哪里。
export default defineConfig({
  schema: './db/schema.ts',
  // Sites 打包器会从项目根目录的 drizzle 读取并安全执行增量迁移。
  out: './drizzle',
  dialect: 'sqlite',
});
