/* 
MISSING ICONS → add custom SVGs later if desired:
- Alembic (currently using outlined Python logo as fallback)
- Pytest (using Python icon as fallback)
- Vitest (using Vite icon as fallback)
- PM2 (using Node.js icon as fallback)
- Debian (using Linux icon as fallback)
- WSL (using Linux icon as fallback)
*/

// FRONTEND
import { FaReact, FaVuejs, FaNodeJs, FaWindows } from 'react-icons/fa';
import { TbBrandNextjs, TbBrandAlpineJs } from 'react-icons/tb';
import { SiMdx, SiSvelte, SiVite } from 'react-icons/si';

// BACKEND
import { SiFastapi, SiFastify, SiPrisma, SiSqlite, SiPostgresql, SiMongodb } from 'react-icons/si';
import { AiOutlinePython } from 'react-icons/ai';

// DEVOPS & INFRASTRUCTURE
import { SiDocker, SiNginx, SiCloudflare, SiGithubactions, SiProxmox, SiGitea } from 'react-icons/si';
import { DiLinux } from 'react-icons/di';

// DEV TOOLS & MISC
import { SiMarkdown, SiGithub } from 'react-icons/si';
import { VscCode } from 'react-icons/vsc';
import { DiLinux as DiLinuxAlt } from 'react-icons/di';

// AI / ML
import { SiTensorflow, SiPytorch, SiOllama } from 'react-icons/si';

// TESTING
import { SiCypress } from 'react-icons/si';

export const frontTech = [
  { name: 'React', icon: <FaReact className="text-2xl" />, docs: 'https://react.dev/' },
  { name: 'Next.js', icon: <TbBrandNextjs className="text-2xl" />, docs: 'https://nextjs.org/docs' },
  { name: 'Vue.js', icon: <FaVuejs className="text-2xl" />, docs: 'https://vuejs.org/guide/introduction.html' },
  { name: 'Svelte', icon: <SiSvelte className="text-2xl" />, docs: 'https://svelte.dev/docs' },
  { name: 'Vite', icon: <SiVite className="text-2xl" />, docs: 'https://vitejs.dev/guide/' },
  { name: 'AlpineJS', icon: <TbBrandAlpineJs className="text-2xl" />, docs: 'https://alpinejs.dev/' },
  { name: 'MDX', icon: <SiMdx className="text-2xl" />, docs: 'https://mdxjs.com/' },
];

export const backTech = [
  { name: 'FastAPI', icon: <SiFastapi className="text-2xl" />, docs: 'https://fastapi.tiangolo.com/' },
  { name: 'Fastify', icon: <SiFastify className="text-2xl" />, docs: 'https://fastify.dev/docs/latest/' },
  { name: 'Prisma ORM', icon: <SiPrisma className="text-2xl" />, docs: 'https://www.prisma.io/docs' },
  { name: 'SQLite', icon: <SiSqlite className="text-2xl" />, docs: 'https://www.sqlite.org/docs.html' },
  { name: 'PostgreSQL', icon: <SiPostgresql className="text-2xl" />, docs: 'https://www.postgresql.org/docs/' },
  { name: 'Neon Postgres', icon: <SiPostgresql className="text-2xl" />, docs: 'https://neon.tech/docs/introduction' },
  { name: 'MongoDB', icon: <SiMongodb className="text-2xl" />, docs: 'https://www.mongodb.com/docs/' },
  { name: 'Alembic', icon: <AiOutlinePython className="text-2xl" />, docs: 'https://alembic.sqlalchemy.org/en/latest/' },
];

export const devOpsTech = [
  { name: 'Docker', icon: <SiDocker className="text-2xl" />, docs: 'https://docs.docker.com/' },
  { name: 'NGINX', icon: <SiNginx className="text-2xl" />, docs: 'https://nginx.org/en/docs/' },
  { name: 'Cloudflare Tunnels', icon: <SiCloudflare className="text-2xl" />, docs: 'https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/' },
  { name: 'Proxmox', icon: <SiProxmox className="text-2xl" />, docs: 'https://pve.proxmox.com/wiki/Main_Page' },
  { name: 'GitHub Actions', icon: <SiGithubactions className="text-2xl" />, docs: 'https://docs.github.com/en/actions' },
  { name: 'Gitea Runners', icon: <SiGitea className="text-2xl" />, docs: 'https://docs.gitea.com/usage/actions/overview' },
  { name: 'PM2', icon: <FaNodeJs className="text-2xl" />, docs: 'https://pm2.keymetrics.io/docs/usage/quick-start/' },
  { name: 'Cron Jobs', icon: <DiLinux className="text-2xl" />, docs: 'https://man7.org/linux/man-pages/man5/crontab.5.html' },
];

export const aiTech = [
  { name: 'Ollama', icon: <SiOllama className="text-2xl" />, docs: 'https://ollama.com/library' },
  { name: 'PyTorch', icon: <SiPytorch className="text-2xl" />, docs: 'https://pytorch.org/docs/stable/index.html' },
  { name: 'TensorFlow', icon: <SiTensorflow className="text-2xl" />, docs: 'https://www.tensorflow.org/learn' },
];

export const testTech = [
  { name: 'Cypress', icon: <SiCypress className="text-2xl" />, docs: 'https://docs.cypress.io/' },
  { name: 'Pytest', icon: <AiOutlinePython className="text-2xl" />, docs: 'https://docs.pytest.org/en/stable/' },
  { name: 'Vitest', icon: <SiVite className="text-2xl" />, docs: 'https://vitest.dev/guide/' },
];

export const toolsTech = [
  { name: 'VS Code', icon: <VscCode className="text-2xl" />, docs: 'https://code.visualstudio.com/docs' },
  { name: 'Cursor', icon: <VscCode className="text-2xl" />, docs: 'https://cursor.sh/' },
  { name: 'GitHub', icon: <SiGithub className="text-2xl" />, docs: 'https://docs.github.com/en' },
  { name: 'Gitea', icon: <SiGitea className="text-2xl" />, docs: 'https://docs.gitea.com/' },
  { name: 'Linux', icon: <DiLinuxAlt className="text-2xl" />, docs: 'https://www.kernel.org/doc/html/latest/' },
  { name: 'Debian', icon: <DiLinuxAlt className="text-2xl" />, docs: 'https://www.debian.org/doc/' },
  { name: 'WSL', icon: <DiLinuxAlt className="text-2xl" />, docs: 'https://learn.microsoft.com/en-us/windows/wsl/' },
  { name: 'Windows', icon: <FaWindows className="text-2xl" />, docs: 'https://learn.microsoft.com/en-us/windows/' },
  { name: 'Markdown', icon: <SiMarkdown className="text-2xl" />, docs: 'https://www.markdownguide.org/' },
];
