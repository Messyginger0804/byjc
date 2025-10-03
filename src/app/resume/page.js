
import siteMetadata from "@/utils/metaData";

export const metadata = {
  title: `Resume | ${siteMetadata.author}`,
  robots: { index: false, follow: false }
};

export default function ResumePage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8">
      <div className="py-4">
        <h1 className="text-2xl font-bold mb-3">{siteMetadata.author} — Resume</h1>
      </div>

      <object data={siteMetadata.resume} type="application/pdf" className="w-full h-screen">
        <p>
          PDF viewer not supported. <a href={siteMetadata.resume} target="_blank" rel="noopener">Open the resume</a>.
        </p>
      </object>
    </main>
  );
}
