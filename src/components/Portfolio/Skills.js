import { frontTech, backTech, devOpsTech, aiTech, toolsTech, businessTech } from "@/data/tech";

const SectionHeader = ({ children }) => (
  <h3 className="text-xl md:text-2xl font-bold mt-12 mb-6 text-center md:text-left">
    <span className="bg-gradient-to-r from-accent to-accent dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 pb-1">
      {children}
    </span>
  </h3>
);

const TechList = ({ items }) => (
  <ul className="flex flex-wrap mt-4 justify-center md:justify-start gap-3 md:gap-4">
    {items.map((item, i) => {
      const content = (
        <>
          <span className="text-xl lg:text-2xl">{item.icon}</span>
          <span>{item.name}</span>
        </>
      );

      const className =
        "flex items-center gap-3 font-bold capitalize text-sm lg:text-base py-3 px-5 glass rounded-2xl transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-light dark:hover:bg-accentDark dark:hover:text-dark border-dark/10 dark:border-light/10 shadow-sm hover:shadow-modern";

      if (item.docs) {
        return (
          <li key={i} className={className}>
            <a
              href={item.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3"
              aria-label={`${item.name} documentation`}
              title={`${item.name} — docs`}
            >
              {content}
            </a>
          </li>
        );
      }

      return (
        <li key={i} className={className} title={item.name}>
          <div className="flex items-center gap-3">
            {content}
          </div>
        </li>
      );
    })}
  </ul>
);

const Skills = () => {
  return (
    <section className="w-full flex flex-col py-20 px-5 xs:px-10 sm:px-12 md:px-16 text-dark dark:text-light">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent dark:text-accentDark text-balance tracking-tight mb-4">
        I'm comfortable working with...
      </h2>
      <p className="text-lg opacity-80 mb-8 max-w-2xl">
        A production-focused stack built around shipping full systems end-to-end, from frontend UX and APIs to infrastructure, automation, and billing.
      </p>

      <div className="space-y-4">
        {/* Front-End */}
        <SectionHeader>Front-End Technologies</SectionHeader>
        <TechList items={frontTech} />

        {/* Back-End */}
        <SectionHeader>Back-End Technologies</SectionHeader>
        <TechList items={backTech} />

        {/* DevOps & Infrastructure */}
        <SectionHeader>DevOps & Infrastructure</SectionHeader>
        <TechList items={devOpsTech} />

        {/* AI / ML */}
        <SectionHeader>AI / ML</SectionHeader>
        <TechList items={aiTech} />

        {/* Tools */}
        <SectionHeader>Developer Tools</SectionHeader>
        <TechList items={toolsTech} />

        {/* Payments & Business Systems */}
        <SectionHeader>Payments & Business Systems</SectionHeader>
        <TechList items={businessTech} />
      </div>
    </section>
  );
};

export default Skills;
