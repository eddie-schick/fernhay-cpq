export default function appendUuidToFileName(
  fileName: string,
  { fileNameHasNoExtension }: { fileNameHasNoExtension?: boolean } = {},
) {
  if (fileNameHasNoExtension) {
    const nameWithUuidAppended = `${fileName}-${crypto.randomUUID()}`;

    return nameWithUuidAppended;
  }

  const splittedFileName = fileName?.split(".");
  const namePart = splittedFileName
    ?.slice(0, splittedFileName.length - 1)
    ?.join(".");
  const extension = splittedFileName?.at(-1);

  const nameWithUuidAppended = `${namePart}-${crypto.randomUUID()}`;

  return `${nameWithUuidAppended}.${extension}`;
}
