import connectMongo from '../../../backend/utils/db';
import Blog from '../../../backend/models/Blog';

export async function GET(req) {
  try {
    await connectMongo();
    const blogs = await Blog.find({ isPublished: true }).sort({ publishedAt: -1 });
    return new Response(JSON.stringify(blogs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
