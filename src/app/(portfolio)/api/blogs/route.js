import { allBlogs } from 'contentlayer/generated'; // Import your blogs source
import { sortBlogs } from '@/utils'; // Import the sort function

export async function GET(req) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blogsbyjc.vercel.app"; // Dynamic base URL

    // Sort blogs and check for data
    const sortedBlogs = sortBlogs(allBlogs);
    if (!sortedBlogs || sortedBlogs.length < 2) {
      throw new Error("Insufficient blogs available");
    }

    const blog = sortedBlogs[1]; // Get the second blog
    console.log("Selected Blog:", blog); // Debugging: Check the structure of the blog

    // Extract and clean the image path
    const cleanImagePath = blog.image?.filePath ? blog.image.filePath.replace(/(\.\.\/)+public\//, "")
    : "placeholder.jpg"; // Fallback image

    const imageUrl = `${baseUrl}/${cleanImagePath}`;

    // Construct the API response
    const latestBlog = {
      title: blog.title || "Untitled Blog",
      snippet: blog.description || "No description available.",
      url: `${baseUrl}/blogs/14-jwtToken`,
      image: imageUrl,
      tags: blog.tags || [],
      data: blog.date
    };

    console.log("API Response:", latestBlog);

    return new Response(JSON.stringify(latestBlog), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/blogs:", error);

    return new Response(
      JSON.stringify({ message: "Failed to fetch blogs", error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
