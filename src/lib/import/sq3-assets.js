export function buildSq3AssetByQuestionNumber(legacySq3Questions) {
  const map = {};

  for (const row of legacySq3Questions ?? []) {
    if (!row?.question_number || !row?.asset) {
      continue;
    }
    const assetName = String(row.asset).trim();
    if (!assetName) {
      continue;
    }
    const fileName = assetName.endsWith(".jpg") ? assetName : `${assetName}.jpg`;
    map[String(row.question_number)] = fileName;
  }

  return map;
}

export function buildLegacyImageDescriptionByFile(imagesMetadata) {
  const map = {};
  for (const row of imagesMetadata ?? []) {
    if (!row?.file_name) {
      continue;
    }
    map[String(row.file_name)] = row.description ?? null;
  }
  return map;
}
