// pages/api/send-blog-of-the-month.js

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  
    try {
      // Retrieve the blog data from the request body.
      // Alternatively, you could fetch this from your database or another service.
      const blogData = req.body;
  
      // URL for your advertisement API endpoint.
      // It's a good practice to store URLs in environment variables.
      const adApiUrl = process.env.AD_API_URL || "https://api.jokebyjc.com/advertise";
  
      // Forward the blog data to the advertisement API
      const response = await fetch(adApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogData)
      });
  
      if (!response.ok) {
        // If the advertisement API returns an error, propagate that status
        return res
          .status(response.status)
          .json({ error: "Failed to send blog data to advertisement API" });
      }
  
      const adResponse = await response.json();
      res.status(200).json({ message: "Blog data sent successfully", adResponse });
    } catch (error) {
      console.error("Error sending blog data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  