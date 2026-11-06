import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { aiTech, backTech, devOpsTech, frontTech, testTech, toolsTech } from "@/data/tech";

// Compact picks per group from src/data/tech.js, by name, so icons and labels stay in sync with that file.
const GROUPS = [
    { label: "Frontend", items: frontTech, pick: ["React", "Next.js", "Vue.js", "Svelte", "Vite"] },
    { label: "Backend", items: backTech, pick: ["Node.js (Express)", "FastAPI", "Fastify", "PostgreSQL", "Drizzle ORM"] },
    { label: "DevOps", items: devOpsTech, pick: ["Docker", "Coolify", "NGINX", "Cloudflare (DNS, SSL, Email Routing)", "Proxmox"] },
    { label: "AI", items: aiTech, pick: ["Claude", "Codex", "Gemini", "Ollama"] },
    { label: "Testing", items: testTech, pick: ["Cypress", "Pytest", "Vitest"] },
    { label: "Tools", items: toolsTech, pick: ["Git", "GitHub", "VS Code", "Linux"] },
];

const SHORT = { "Cloudflare (DNS, SSL, Email Routing)": "Cloudflare", "Node.js (Express)": "Node.js" };

export default function Stack() {
    return (
        <section className="container-page pb-20 md:pb-28" aria-labelledby="stack-heading">
            <Reveal className="max-w-3xl">
                <p className="eyebrow text-gradient mb-3">Toolbox</p>
                <h2 id="stack-heading" className="display-lg font-display text-balance">
                    What I <span className="text-gradient">work with</span>
                </h2>
            </Reveal>
            <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 md:gap-6 lg:grid-cols-3">
                {GROUPS.map((g) => {
                    const tools = g.pick.map((n) => g.items.find((t) => t.name === n)).filter(Boolean);
                    return (
                        <StaggerItem key={g.label}>
                            <div className="glass-card h-full p-5 md:p-6">
                                <h3 className="eyebrow mb-4">{g.label}</h3>
                                <ul className="flex flex-wrap gap-2">
                                    {tools.map((t) => (
                                        <li key={t.name} className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium">
                                            <span className="flex h-5 w-5 items-center justify-center text-accent dark:text-accent-bright [&_svg]:h-5 [&_svg]:w-5 [&_span]:h-5 [&_span]:w-5 [&_span]:text-[8px]" aria-hidden="true">{t.icon}</span>
                                            {SHORT[t.name] || t.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </StaggerItem>
                    );
                })}
            </Stagger>
        </section>
    );
}
