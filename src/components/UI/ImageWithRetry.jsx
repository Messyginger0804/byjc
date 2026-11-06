"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export default function ImageWithRetry({
  src,
  alt,
  fallbackSrc = "/blog-images/fadedcomputer.jpg",
  retries = MAX_RETRIES,
  retryDelay = RETRY_DELAY_MS,
  onLoad,
  onError,
  ...props
}) {
  const source = src || fallbackSrc;
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(source);
  const [trackedSource, setTrackedSource] = useState(source);
  const srcRef = useRef(source);
  const retriesRef = useRef(retries);
  const retryDelayRef = useRef(retryDelay);
  const retryTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(retryTimerRef.current), []);

  useEffect(() => {
    clearTimeout(retryTimerRef.current);
    srcRef.current = source;
  }, [source]);

  useEffect(() => {
    retriesRef.current = retries;
  }, [retries]);

  useEffect(() => {
    retryDelayRef.current = retryDelay;
  }, [retryDelay]);

  // Reset retry state during render when the source changes.
  if (trackedSource !== source) {
    setTrackedSource(source);
    setRetryCount(0);
    setCurrentSrc(source);
  }

  const handleLoad = useCallback((e) => {
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e) => {
    if (currentSrc !== fallbackSrc && retryCount < retriesRef.current) {
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);
      retryTimerRef.current = setTimeout(() => {
        const separator = srcRef.current.includes('?') ? '&' : '?';
        setCurrentSrc(`${srcRef.current}${separator}retry=${nextRetry}&t=${Date.now()}`);
      }, retryDelayRef.current * nextRetry);
    } else if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      onError?.(e);
    }
  }, [currentSrc, fallbackSrc, retryCount, onError]);

  return (
    <Image
      src={currentSrc}
      alt={alt ?? "Blog post illustration"}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
}
