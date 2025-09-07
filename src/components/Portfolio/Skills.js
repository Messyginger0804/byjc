import { frontTech, backTech, devOpsTech, aiTech, toolsTech } from "@/data/tech";

const SectionHeader = ({ children }) => (
  <h3 className="ml-12 sm:ml-20 md:ml-24">
    <span className="inline-block bg-gradient-to-r from-accent to-accent dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500">
      {children}
    </span>
  </h3>
);

const TechList = ({ items }) => (
  <ul className="flex flex-wrap mt-4 justify-center">
    {items.map((item, i) => {
      const content = (
        <>
          <span className="text-lg lg:text-xl">{item.icon}</span>
          {item.name}
        </>
      );

      const className =
        "flex items-center gap-2 font-semibold capitalize text-sm lg:text-lg py-2 lg:py-5 px-4 lg:px-6 border-2 border-solid rounded mr-2 lg:mr-4 mb-2 lg:mb-4 transition-all ease duration-200 bg-accent/60 dark:bg-accentDark text-light dark:text-dark hover:scale-105 border-dark dark:border-light";

      if (item.docs) {
        return (
          <li key={i} className={className}>
            <a
              href={item.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
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
          {content}
        </li>
      );
    })}
  </ul>
);

const Skills = () => {
  return (
    <section className="w-full flex flex-col p-5 xs:p-10 sm:p-12 md:p-16 lg:p-20 text-dark dark:text-light">
      <span className="font-semibold text-lg sm:text-2xl md:text-3xl lg:text-4xl text-accent dark:text-accentDark">
        I'm comfortable working with...
      </span>

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
    </section>
  );
};

export default Skills;
