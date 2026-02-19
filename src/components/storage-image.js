"use client";

import { useEffect, useState } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { firebaseStorage } from "../lib/firebase/client.js";

const urlCache = new Map();

function resolveStoragePath(imageStoragePath, imageRef) {
  if (imageStoragePath) {
    return imageStoragePath;
  }
  if (imageRef) {
    return `question-assets/${imageRef}`.replace(/\/+/g, "/");
  }
  return null;
}

export default function StorageImage({ imageStoragePath, imageRef, alt, className }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const path = resolveStoragePath(imageStoragePath, imageRef);
    if (!path) {
      setUrl("");
      setFailed(false);
      return;
    }

    if (urlCache.has(path)) {
      setUrl(urlCache.get(path));
      setFailed(false);
      return;
    }

    let canceled = false;
    getDownloadURL(ref(firebaseStorage, path))
      .then((downloadUrl) => {
        if (canceled) {
          return;
        }
        urlCache.set(path, downloadUrl);
        setUrl(downloadUrl);
        setFailed(false);
      })
      .catch(() => {
        if (canceled) {
          return;
        }
        setFailed(true);
        setUrl("");
      });

    return () => {
      canceled = true;
    };
  }, [imageStoragePath, imageRef]);

  if (!imageStoragePath && !imageRef) {
    return null;
  }

  if (failed || !url) {
    return <p className="muted">התמונה לא זמינה כרגע.</p>;
  }

  return <img src={url} alt={alt} className={className} />;
}
