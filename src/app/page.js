// import Image from 'next/image'
import FeatuedPosts from '@/components/Home/FeatuedPosts'
import HomeCover from '@/components/Home/HomeCover'
import RecentPosts from '@/components/Home/RecentPost'
import { allBlogs } from 'contentlayer/generated'

export default function Home() {
  console.log(allBlogs)
  return (
    <main className="flex flex-col items-center justify-center">
      <HomeCover blogs={allBlogs} />
      <FeatuedPosts blogs={allBlogs} />
      {/* <RecentPosts blogs={allBlogs} /> */}
    </main>
  )
}
