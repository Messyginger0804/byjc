// Separate module so LazyMotion can load it asynchronously (keeps it out of the initial bundle).
// domMax (not domAnimation) is required for `layoutId` shared-layout animations and drag.
import { domMax } from 'motion/react';

export default domMax;
