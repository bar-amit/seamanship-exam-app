"use client";

import ClickableStorageImage from "./clickable-storage-image.js";
import { getQuestionImageItems } from "../features/questions/assets.js";

export default function QuestionImageList({ question, altForImage, className = "question-image inline-thumb" }) {
  const images = getQuestionImageItems(question);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="question-image-list">
      {images.map((image, index) => (
        <ClickableStorageImage
          key={image.imageRef}
          imageStoragePath={image.imageStoragePath}
          imageRef={image.imageRef}
          alt={altForImage?.(image.imageRef, index) ?? image.imageRef}
          className={className}
        />
      ))}
    </div>
  );
}
