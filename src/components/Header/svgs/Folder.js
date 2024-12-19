import * as React from "react";
import { cssFunc } from "@/utils";

const Folder = ({ className, ...remainingProps }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={42}
        height={56}
        viewBox="0 0 24 24"
        className={cssFunc(className, "w-full h-auto")}
        {...remainingProps}
    >
        <path
            fillRule="evenodd"
            d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
            clipRule="evenodd"
        />
    </svg>
);

export default Folder;
