
import siteMetadata from "@/utils/metaData";

export const metadata = {
  title: `Resume | ${siteMetadata.author}`,
  robots: { index: false, follow: false } // keep it off search engines
};

export default function ResumePage() {
  return (
    <main style={{maxWidth: 960, margin: "40px auto", padding: 16}}>
      <h1 style={{marginBottom: 12}}>{siteMetadata.author} — Resume</h1>
      <p style={{marginBottom: 16}}>
        <a href={siteMetadata.resume} target="_blank" rel="noopener">Open PDF</a>
        <span style={{margin: "0 10px"}}>·</span>
        <a href="/api/resume/download">Download</a>
      </p>

      <object data={siteMetadata.resume} type="application/pdf" width="100%" height="900">
        <p>
          PDF viewer not supported. <a href={siteMetadata.resume} target="_blank" rel="noopener">Open the resume</a>.
        </p>
      </object>
    </main>
  );
}
