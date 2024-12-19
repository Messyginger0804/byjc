import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  publishedAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  author: { type: String, required: true },
  isPublished: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  content: { type: String, required: true },
});

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
