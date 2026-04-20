

export const link = {
    resume: 'https://drive.google.com/file/d/1uElUd-wQfacsXWdgJ7afAv8Y8N6KE8pZ/view',
    linkedin: 'https://www.linkedin.com/in/dev-jc/',
    github: 'https://github.com/messyginger0804',
    twitter: 'https://twitter.com/messyginger0804',
    blog: 'https://blogsbyjc.vercel.app/',
}

export const bannerStuff = [
    "Full-Stack Software Developer at Onix Media 💻",
    "UTD Alumni 🎓",
    "10+ Years of Management Experience 💼",
    "Freelance Developer 📄",
    "Member of Dallas Software Developer Group 🌐",
    "Blogger 📝",
    "Funny Guy 😜",
    "Open Source Contributor 🌱",
    "Passionate about AI & ML 🤖",
    "DevOps Enthusiast ⚙️",
    "Cloud & Self-Hosting Explorer ☁️🖥️",
    "Cypress & QA Testing Advocate 🧪",
    "Speaker & Community Mentor 🎤",
    "Lifelong Learner 📚",
    "Coffee Powered ☕",
    "Star Trek Fan 🖖",
];

// utilities.js or your utilities file
export function truncateText(text, maxLength) {
    if (text?.length <= maxLength) {
        return text;
    }

    // Truncate the text and append ellipsis
    return text?.slice(0, maxLength) + '...';
}

const techLinks = {
    'WordPress': 'https://wordpress.org/',
    'React': 'https://react.dev/',
    'Next.js': 'https://nextjs.org/docs',
    'Node.js': 'https://nodejs.org/en/docs',
    'FastAPI': 'https://fastapi.tiangolo.com/',
    'Docker': 'https://docs.docker.com/',
    'Coolify': 'https://coolify.io/docs/',
    'NGINX': 'https://nginx.org/en/docs/',
    'Cloudflare': 'https://developers.cloudflare.com/',
    'Stripe': 'https://docs.stripe.com/',
    'Mailchimp': 'https://mailchimp.com/help/',
    'Calendly': 'https://help.calendly.com/hc/en-us',
    'vanilla JavaScript': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    'JavaScript': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    'Tailwind CSS': 'https://tailwindcss.com/docs',
    'Responsive Web Design': 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design',
    'Java Spring Boot': 'https://spring.io/projects/spring-boot',
    'Java': 'https://docs.oracle.com/en/java/',
    'Vite': 'https://vitejs.dev/guide/',
    'MongoDB': 'https://www.mongodb.com/docs/',
    'Contentlayer': 'https://contentlayer.dev/docs',
    'MDX': 'https://mdxjs.com/',
    'next-sitemap': 'https://github.com/iamvishnusankar/next-sitemap',
    'Redux Toolkit': 'https://redux-toolkit.js.org/',
    'Redux': 'https://redux.js.org/',
    'Toastify': 'https://fkhadra.github.io/react-toastify/introduction',
    'axios': 'https://axios-http.com/docs/intro',
    'Firebase': 'https://firebase.google.com/docs',
    'Fake Store API': 'https://fakestoreapi.com/',
    "Google's API": 'https://developers.google.com/apis-explorer',
};

const techPattern = new RegExp(
    Object.keys(techLinks)
        .sort((a, b) => b.length - a.length)
        .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|'),
    'g'
);

export function renderLinkedTechText(text, maxLength) {
    const content = typeof maxLength === 'number' ? truncateText(text, maxLength) : text;

    if (!content) {
        return content;
    }

    const parts = content.split(techPattern);
    const matches = content.match(techPattern) ?? [];

    return parts.flatMap((part, index) => {
        const match = matches[index];

        if (!match) {
            return part;
        }

        return [
            part,
            <a
                key={`${match}-${index}`}
                href={techLinks[match]}
                target='_blank'
                rel='noopener noreferrer'
                className='underline decoration-accent/50 underline-offset-2 hover:text-accent dark:hover:text-accentDark transition-colors'
            >
                {match}
            </a>,
        ];
    });
}


export const heading = (x) => {
    if (x) {
        // return <h2 className={css}>Work in progress</h2>
        return <b className='notFinished'>Work in progress</b>
    }
}
export const button = (a, link, css1, css2) => {
    if (a) {
        return <a href={link} className='btn-primary' target='_blank'>Live Site</a>
    } else {
        return (
            <div className='btn-disabled' target='_blank'>Live Site</div>)
    }
}
