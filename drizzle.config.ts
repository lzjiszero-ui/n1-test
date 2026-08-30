import { defineConfig } from 'drizzle-kit';

// 告诉数据库工具：表结构在哪里，以及生成的 SQLite 迁移文件放在哪里。
export default defineConfig({
  schema: './db/schema.ts',
  out: './.openai/drizzle',
  dialect: 'sqlite',
});
