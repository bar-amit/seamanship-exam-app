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

export default function ClickableStorageImage({
  imageStoragePath,
  imageRef,
  alt,
  className,
  modalAlt
}) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  if (!imageStoragePath && !imageRef) {
    return null;
  }

  if (failed || !url) {
    return <p className="muted">התמונה לא זמינה כרגע.</p>;
  }

  return (
    <>
      <button type="button" className="image-button" onClick={() => setIsOpen(true)}>
        <img src={url} alt={alt} className={className} />
      </button>
      {isOpen && (
        <div className="image-modal-backdrop" onClick={() => setIsOpen(false)}>
          <div className="image-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="image-modal-close" onClick={() => setIsOpen(false)}>
              ×
            </button>
            <img src={url} alt={modalAlt || alt} className="image-modal-img" />
          </div>
        </div>
      )}
    </>
  );
}
