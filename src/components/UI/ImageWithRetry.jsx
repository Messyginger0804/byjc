"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export default function ImageWithRetry({
  src,
  alt,
  retries = MAX_RETRIES,
  retryDelay = RETRY_DELAY_MS,
  onLoad,
  onError,
  ...props
}) {
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const srcRef = useRef(src);
  const retriesRef = useRef(retries);
  const retryDelayRef = useRef(retryDelay);

  useEffect(() => {
    srcRef.current = src;
  }, [src]);

  useEffect(() => {
    retriesRef.current = retries;
  }, [retries]);

  useEffect(() => {
    retryDelayRef.current = retryDelay;
  }, [retryDelay]);

  const handleLoad = useCallback((e) => {
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e) => {
    if (retryCount < retriesRef.current) {
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);
      setTimeout(() => {
        setCurrentSrc(`${srcRef.current}?retry=${nextRetry}&t=${Date.now()}`);
      }, retryDelayRef.current * nextRetry);
    } else {
      onError?.(e);
    }
  }, [retryCount, onError]);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
}