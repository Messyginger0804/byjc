import tias from '../components/About/assets/tias-logo.png'
import port from '../components/About/assets/port.jpg'
import google from '../components/About/assets/google.jpg'
import movieReview from '../components/About/assets/movieReview.jpg'
import blog from '../components/About/assets/profile.png'
import fcc from '../components/About/assets/freecodecamp.png'

export const projects = [
    {
        isPublished: true,
        inProgress: false,
        title: "FreeCodeCamp",
        image: fcc,
        descTitle: 'FreeCodeCamp Portfolio',
        desc: 'Explore my FreeCodeCamp portfolio—a culmination of projects crafted using vanilla JavaScript and Tailwind CSS, following the Responsive Web Design roadmap. This single-page application, my inaugural project with routing, is devoid of frameworks. Immerse yourself in my projects and witness the passion fueling my journey in web development!',
        repo: 'https://github.com/Messyginger0804/freeCodeCampPortfolio.git',
        live: 'https://jcfreecodecamp.netlify.app/',
    },
    {
        isPublished: true,
        inProgress: false,
        title: "Poopie Review",
        image: movieReview,
        descTitle: 'Movie Review Site',
        desc: 'Dive into movie reviews on PoopieMovies, my inaugural Java project, blending React, Vite, and Tailwind CSS for frontend allure, and venturing into Java Spring Boot and MongoDB for the backend magic. Uncover unique critiques from Braylee and Ruby, making this my first foray into Java development.',
        repo: 'https://github.com/Messyginger0804/poopiemovies',
        live: 'https://poopiereviews.netlify.app/',
    },
    {
        isPublished: true,
        inProgress: false,
        title: "Blogs by JC",
        image: blog,
        descTitle: 'This Blog Site',
        desc: '"Blogs by JC" was created using Next.js, Tailwind CSS, and Contentlayer, offering an engaging user experience with MDX blog posts. The project represents my first experience with MDX, Next.js dynamic routing, and next-sitemap for SEO optimization.',
        repo: 'https://github.com/Messyginger0804/blogs-by-jc-focontent',
        live: 'https://blogsbyjc.vercel.app/',
    },
    {
        isPublished: true,
        inProgress: false,
        title: "Tias.com",
        image: tias,
        descTitle: 'Fullstack e-comerce site',
        desc: 'Discover Tias, your e-commerce hub built using Next.js, Stripe for payments, and featuring my inaugural experience with Redux and Redux Toolkit. Toastify handles notifications, axios manages API requests, while Firebase and Fake Store API provide product data. Unveil a robust, feature-rich e-commerce solution.',
        repo: 'https://github.com/Messyginger0804/tias',
        live: 'https://tias.netlify.app/',
    },
    {
        isPublished: true,
        inProgress: false,
        title: "Google-Clone",
        image: google,
        descTitle: 'A Clone of Google.com',
        desc: "Introducing Gugal: My first project with Next.js, Tailwind CSS, and Firebase! A Google clone that fetches and displays search results from Google's API. Explore how to work with APIs and JSON data effectively.",
        repo: 'https://github.com/Messyginger0804/gugal',
        live: 'https://jcsgoogle.netlify.app/',
    },
    {
        isPublished: true,
        inProgress: false,
        title: "My 1st Portfolio Site",
        image: port,
        descTitle: 'Web App to host projects.',
        desc: `Welcome to my Next.js portfolio website. It's my first foray into Next.js, and although it's currently a single-page app, I've utilized Next.js features like image and link components for a sleek and responsive design, enhanced by Tailwind CSS.`,
        repo: 'https://github.com/Messyginger0804/next.js-portfolio',
        live: 'https://jcashleyportfolio.netlify.app/',
    },
]