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
  const [attempt, setAttempt] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(source);
  const srcRef = useRef(source);
  const retriesRef = useRef(retries);
  const retryDelayRef = useRef(retryDelay);
  const retryTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(retryTimerRef.current), []);

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
    if (currentSrc !== fallbackSrc && retryCount < retriesRef.current) {
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);
      retryTimerRef.current = setTimeout(() => {
        // next/image rejects query strings on local paths (400 in prod, thrown in dev),
        // so only remote URLs get a cache-busting parameter; local ones remount below.
        if (srcRef.current.startsWith('/')) {
          setAttempt(nextRetry);
          return;
        }
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
      key={`${currentSrc}#${attempt}`}
      src={currentSrc}
      alt={alt ?? "Blog post illustration"}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
}
