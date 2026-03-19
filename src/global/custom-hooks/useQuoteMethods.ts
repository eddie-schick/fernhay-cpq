import { useCallback } from "react";

/**
 * useQuoteMethods — client-side stub
 *
 * The original version uploaded PDFs to a cloud bucket via signed URLs
 * and then updated the quote record on the backend.  Since the app is
 * now frontend-only, we skip all remote calls.  The PDFs are already
 * generated in-memory (via @react-pdf/renderer) and available as Blobs,
 * so there is nothing to upload.
 */
export default function useQuoteMethods() {
  const updateQuoteAndBomFileLinksInQuote = useCallback(
    async ({
      quotationId,
      fullPdfBlob,
      bomPdfBlob,
      updatedId,
      updateThis = "all",
    }: {
      quotationId: string;
      fullPdfBlob: Blob;
      bomPdfBlob: Blob;
      updatedId: string;
      updateThis?: "all" | "quote" | "bom";
    }) => {
      // No-op: PDFs live in memory; no backend to upload to.
      console.log(
        "[useQuoteMethods] Skipping cloud upload (no backend).",
        { quotationId, updatedId, updateThis },
      );
    },
    [],
  );

  return { updateQuoteAndBomFileLinksInQuote };
}
