import * as React from "react"
import { cssFunc } from '@/utils';

const Profile = ({ className, remainingProps }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={42}
        height={43}
        viewBox="0 0 42 43"
        // className={cssFunc(className, "w-full h-auto")}
        className={cssFunc(className, "w-[3rem] h-[3.3rem]")}
        {...remainingProps}

    >
        <title>{"profile_minus [#1340]"}</title>
        <path
            // fill="#000"
            // fillRule="nonzero"
            // fillRule="inherit"
            fillRule="evenodd"
            path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm10 9h-5v2h5v-2zm0 4h-5v2h5v-2zm-6-8V3.5L18.5 9H14a2 2 0 0 1-2-2z"
        />
    </svg>
)
export default Profile