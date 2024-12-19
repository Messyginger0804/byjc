import InsightBanner from "@/components/About/InsightBanner";
import { bannerStuff } from "@/data/utilities";


export default function AboutLayout({ children }) {
    return (
        <main className="w-full flex flex-col items-center justify-between">
            <InsightBanner insights={bannerStuff} />
            {children}
        </main>
    );
}