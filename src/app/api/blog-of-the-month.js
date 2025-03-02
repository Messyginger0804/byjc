// pages/api/send-blog-of-the-month.js

export default async function handler(req, res) {
  // Only allow GET requests for retrieving the blog
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    // Fallback data in case there's no real blog data
    const fallbackBlog = {
      title: "The Benefits of Internships in Tech",
      url: "https://byjc.dev/blogs/benefits-of-internships",
      snippet:
        "Internships are a great way to gain hands-on experience in the tech industry. Learn how they can set you up for success!",
      image: "/blog-images/internship.png", // Assuming your images are stored in /public/blog-images
      tags: ["Career", "Internship", "Tech"],
    };

    // Simulating retrieving blog data (Replace this with actual database retrieval logic)
    const blogOfTheMonth = fallbackBlog;

    // Log for debugging
    console.log("Sending Blog of the Month:", blogOfTheMonth);

    // Send the blog data to the client
    return res.status(200).json(blogOfTheMonth);
  } catch (error) {
    console.error("Error sending blog data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
