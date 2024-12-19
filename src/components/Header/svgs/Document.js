import * as React from "react";
import { cssFunc } from "@/utils";

const Document = ({ className, ...remainingProps }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={42}
        height={46}
        viewBox="0 0 24 24"
        className={cssFunc(className, "w-full h-auto")}
        {...remainingProps}
    >
        <path
            fillRule="evenodd"
            d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm10 9h-5v2h5v-2zm0 4h-5v2h5v-2zm-6-8V3.5L18.5 9H14a2 2 0 0 1-2-2z"
            clipRule="evenodd"
        />
    </svg>
);

export default Document;
