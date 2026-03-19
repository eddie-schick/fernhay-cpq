import { pdf as Libpdf } from "@react-pdf/renderer";

import { useEffect, useState } from "react";

type Props = {
  QuotePdf?: JSX.Element | null;
  BomPdf?: JSX.Element | null;
};
export default function usePdfsBlobs(props: Props) {
  const { QuotePdf, BomPdf } = props;

  const [quotePdfBlob, setQuotePdfBlob] = useState<null | Blob>(null);
  const [bomPdfBlob, setBomPdfBlob] = useState<null | Blob>(null);

  useEffect(() => {
    (async () => {
      if (QuotePdf) {
        try {
          setQuotePdfBlob(null);
          const pdfInBlob = await Libpdf(QuotePdf).toBlob();
          setQuotePdfBlob(pdfInBlob);
        } catch (error) {
          console.log(
            "%cusePdfsBlobs error 1:",
            "background-color:red;color:white;",
            {
              error,
            },
          );
        }
      }
    })();
  }, [QuotePdf]);

  useEffect(() => {
    (async () => {
      if (BomPdf) {
        try {
          setBomPdfBlob(null);
          const pdfInBlob = await Libpdf(BomPdf).toBlob();
          setBomPdfBlob(pdfInBlob);
        } catch (error) {
          console.log(
            "%cusePdfsBlobs error 2:",
            "background-color:red;color:white;",
            {
              error,
            },
          );
        }
      }
    })();
  }, [BomPdf]);

  return { quotePdfBlob, bomPdfBlob };
}
