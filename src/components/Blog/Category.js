import Link from "next/link";
import React from "react";
import { cssFunc } from '@/utils';

const Category = ({ link = "#", name, active, ...props }) => {
    return (
        <Link
            href={link}
            aria-current={active ? 'page' : undefined}
            className={cssFunc(
                "relative inline-flex items-center rounded-full px-5 py-2 font-mono-jb text-xs uppercase tracking-[0.12em] transition-colors border border-ink/10 dark:border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2",
                active ? "bg-signal-cta text-white border-transparent" : "text-muted hover:text-ink dark:hover:text-white",
                props.className
            )}
        >
            <span className="relative">#{name}</span>
        </Link>
    );
};

export default Category;
