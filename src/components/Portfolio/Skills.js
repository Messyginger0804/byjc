import { frontTech, backTech, devOpsTech, aiTech, toolsTech, businessTech } from "@/data/tech";
import Reveal from "@/components/Motion/Reveal";
import { Stagger, StaggerItem } from "@/components/Motion/Stagger";

const chipFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink";

const TechList = ({ items }) => (
  <Stagger as="ul" stagger={0.04} className="mt-4 flex flex-wrap gap-2.5">
    {items.map((item, i) => {
      const content = (
        <>
          <span aria-hidden="true" className="text-lg lg:text-xl">{item.icon}</span>
          <span>{item.name}</span>
        </>
      );

      const className =
        "inline-flex items-center gap-2.5 rounded-full glass px-4 py-2 text-sm font-semibold capitalize transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-white dark:hover:bg-accent-bright dark:hover:text-ink";

      if (item.docs) {
        return (
          <StaggerItem as="li" y={12} key={i}>
            <a
              href={item.docs}
              target="_blank"
              rel="noopener noreferrer"
              className={`${className} ${chipFocus}`}
              aria-label={`${item.name} documentation`}
              title={`${item.name} — docs`}
            >
              {content}
            </a>
          </StaggerItem>
        );
      }

      return (
        <StaggerItem as="li" y={12} key={i}>
          <div className={className} title={item.name}>
            {content}
          </div>
        </StaggerItem>
      );
    })}
  </Stagger>
);

const groups = [
  ["Front-End Technologies", frontTech],
  ["Back-End Technologies", backTech],
  ["AI & LLMs", aiTech],
  ["Infrastructure & DevOps", devOpsTech],
  ["Developer Tools", toolsTech],
  ["Payments & Business Systems", businessTech],
];

const Skills = () => {
  return (
    <section className="container-page py-16 md:py-24">
      <Reveal className="max-w-3xl">
        <p className="eyebrow text-gradient">Skills</p>
        <h2 className="display-lg mt-3 text-balance">I&apos;m comfortable working with...</h2>
        <p className="mt-5 text-lg text-muted max-w-2xl">
          A production-focused stack for shipping whole systems: front end and APIs, LLM-powered features and agents, self-hosted and cloud infrastructure, automation, and billing.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {groups.map(([title, items]) => (
          <Reveal key={title} className="glass-card rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-bold">{title}</h3>
            <TechList items={items} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Skills;
