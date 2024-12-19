import { sortBlogs } from '@/utils'; // Assuming sortBlogs is already implemented

// Function to sort and select specific blogs
export const getSortedBlogs = (blogs) => {
  const sortedBlogs = sortBlogs(blogs);

  // Define specific blogs based on sorted order
  const blogOfTheMonth = sortedBlogs[1]; // For HomeCover
  const featuredBlogs = {
    main: sortedBlogs[2], // For BlogLayoutOne
    secondary1: sortedBlogs[5], // For BlogLayoutTwo
    secondary2: sortedBlogs[0], // For BlogLayoutTwo
  };

  return { blogOfTheMonth, featuredBlogs };
};

// Example usage in components
export const getBlogOfTheMonth = (blogs) => getSortedBlogs(blogs).blogOfTheMonth;

export const getFeaturedBlogs = (blogs) => getSortedBlogs(blogs).featuredBlogs;
