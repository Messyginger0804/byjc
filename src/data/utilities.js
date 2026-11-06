

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

export function truncateText(text, maxLength) {
    if (text?.length <= maxLength) {
        return text;
    }

    // Truncate the text and append ellipsis
    return text?.slice(0, maxLength) + '...';
}
