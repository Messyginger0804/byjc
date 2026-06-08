"use client";

import { forwardRef } from "react";
import ImageWithRetry from "./ImageWithRetry";

const MdxImageWithRetry = forwardRef((props, ref) => {
  const { src, alt, ...rest } = props;
  return (
    <ImageWithRetry
      ref={ref}
      src={src}
      alt={alt}
      retries={3}
      retryDelay={1000}
      {...rest}
    />
  );
});

MdxImageWithRetry.displayName = "MdxImageWithRetry";

export default MdxImageWithRetry;