import fam from "../../public/about-images/ma-and-fam.jpg";
import service from "../../public/about-images/serviceCollege.png";
import cyc from "../../public/about-images/cyc.png";
import dsd from "../../public/about-images/dsd2.png";

export const sections = [
    {
        title: "Family Man",
        text: `As a proud father of three, my family is at the heart of everything I do. They inspire me to push boundaries and strive for excellence in all aspects of life. Whether it’s late-night coding or weekend adventures, I cherish every moment spent with them and work to create a better future for us all.`,
        image: fam,
        alt: "Me with my family",
        reverse: false,
    },
    {
        title: "Service Industry Roots",
        text: `Before diving into software development, I spent over 15 years in the service industry as an employee and a manager. This experience taught me the importance of communication, leadership, and adaptability—skills that continue to serve me well in my tech career.`,
        image: service,
        alt: "Service industry work",
        reverse: true,
    },
    {
        title: "Commit Your Code Conference",
        text: `I’ve now attended Commit Your Code twice, and it’s still the only conference I’ve ever been to — and I absolutely loved it. The energy, the people, and the sense of community make it such a special experience. It’s inspiring to see developers from all walks of life come together, share knowledge, and support each other. Hopefully, we’ll get to do it again next year, because this community is something truly worth celebrating.`,
        image: cyc,
        alt: "Commit Your Code Conference",
        reverse: false,
    },
    {
        title: "Dallas Software Developer",
        text: `As an active member of the Dallas Software Developer Meetups, I’ve had the opportunity to share my knowledge and learn from an incredible community of tech enthusiasts. Giving talks and collaborating with fellow developers has been both rewarding and enriching. I’m excited for future opportunities to engage with this vibrant community.`,
        image: dsd,
        alt: "Dallas Software Developer Meetup",
        reverse: true,
    },
];
