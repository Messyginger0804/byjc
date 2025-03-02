// pages/api/send-blog-of-the-month.js
import Cors from "cors";

// Initialize CORS middleware
const cors = Cors({
  origin: "*", // Allow requests from any origin
  methods: ["GET"], // Allow only GET requests
  allowedHeaders: ["Content-Type"],
});

// Helper function to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // Run CORS middleware
  await runMiddleware(req, res, cors);

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const fallbackBlog = {
      title: "Why you should use TailwindCSS",
      url: "https://www.byjc.dev/blogs/2-TailwindCSS",
      snippet:
        "An introduction to TailwindCSS | What is TailwindCSS? | Why is my TailwindCSS not working?",
      image: "/blog-images/tailwindcss.png",
      tags: ["TailwindCSS", "web development", "css styling"],
    };

    console.log("Sending Blog of the Month:", fallbackBlog);

    res.status(200).json(fallbackBlog);
  } catch (error) {
    console.error("Error sending blog data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
