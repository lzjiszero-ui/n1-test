import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import hostingConfig from './.openai/hosting.json';

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  '00000000-0000-4000-8000-000000000000';

// 从托管配置中读取网站绑定的数据库和文件存储名称。
const { d1, r2 } = hostingConfig;

// macOS 的 Codex 沙盒无法使用系统文件事件，因此预览时改用轮询检测代码变化。
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

// 把应用入口、数据库和文件存储转换为 Cloudflare 本地运行所需的配置。
const localBindingConfig = {
  main: 'vinext/server/fetch-handler',
  compatibility_flags: ['nodejs_compat'],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: 'site-creator-d1',
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: 'site-creator-r2',
        },
      ]
    : [],
};

// 组合 Next.js 兼容层、站点托管和 Cloudflare 插件，形成最终的开发/构建配置。
export default defineConfig(async () => {
  // 把 Wrangler 和 Miniflare 的运行记录留在项目内；应用密钥仍应放在忽略提交的 .env 文件中。
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  // Wrangler 会在插件加载时确定日志路径，所以必须先完成上面的环境设置再导入插件。
  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: localBindingConfig,
      }),
    ],
  };
});
