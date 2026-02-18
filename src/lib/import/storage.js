import fs from "node:fs";

export async function uploadAssetsToStorage({ bucket, uploadPlan }) {
  const uploaded = [];
  const missing = [];

  for (const item of uploadPlan) {
    if (!fs.existsSync(item.sourcePath)) {
      missing.push(item.ref);
      continue;
    }

    await bucket.upload(item.sourcePath, {
      destination: item.destinationPath,
      metadata: {
        cacheControl: "public, max-age=31536000, immutable"
      }
    });

    uploaded.push(item.ref);
  }

  return { uploaded, missing };
}
