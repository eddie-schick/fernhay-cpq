import { PDFDocument } from "pdf-lib";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

import LocalStorageKeys from "~/constants/local-storage-keys";

import useQuoteMethods from "~/global/custom-hooks/useQuoteMethods";
import PageLoader from "~/global/page-loader";

import { RootState, useAppSelector } from "~/store";
import { useGetGeneralQuery } from "~/store/endpoints/misc/misc";
import { useGetSingleQuoteQuery } from "~/store/endpoints/quotes/quotes";
import { selectQuoteById } from "~/store/slices/quotes/slice";
import { NewQuoteShape } from "~/store/slices/quotes/types";

import usePdfsBlobs from "~/components/qutotation-summary/hooks/usePdfsBlobs";
import IncompleteCustomerInfoModal from "~/components/qutotation-summary/incomplete-customer-info-modal/incomplete-customer-info-modal";
import { BomPDF } from "~/components/shared/bom-pdf/bom-pdf";
import useCustomToast from "~/components/shared/use-custom-toast/use-custom-toast";

import { useAuthContextValue } from "../auth-context";

import useBomPdfProps from "./useBomPdfProps";

import { QuotationSummaryPageContext } from ".";

export default function QuotationSummaryPageProvider(props: PropsWithChildren) {
  const [searchParams] = useSearchParams();
  const createdQuoteId = searchParams.get("createdQuoteId");
  const quoteId = searchParams.get("quoteId");

  const { triggerToast } = useCustomToast();

  const { user } = useAuthContextValue();

  const newQuoteById = useAppSelector((state: RootState) =>
    selectQuoteById(state, quoteId!),
  ) as NewQuoteShape;

  const selectedGroup = newQuoteById?.groups?.find(
    (group) => group.isSelected === true,
  ) as NewQuoteShape["groups"][number];
  const specSheetUrl =
    newQuoteById?.vehicleSpecSheets?.[0]?.file?.url ||
    selectedGroup?.chassis?.spec_sheet?.file?.url;
  const isCustomerFormFilled = (() => {
    if (!newQuoteById) return false;

    const { customerDetailsForm } = newQuoteById;

    if (
      customerDetailsForm?.name &&
      customerDetailsForm?.representativeName &&
      customerDetailsForm?.email &&
      customerDetailsForm?.phone &&
      customerDetailsForm?.address &&
      customerDetailsForm?.city &&
      customerDetailsForm?.state &&
      customerDetailsForm?.zipCode &&
      customerDetailsForm?.country
    ) {
      return true;
    }

    return false;
  })();
  const isDestinationAddressFormFilled = (() => {
    if (!newQuoteById) return false;

    const { destinationAddressForm } = newQuoteById;

    if (
      destinationAddressForm?.address &&
      destinationAddressForm?.city &&
      destinationAddressForm?.state &&
      destinationAddressForm?.zipCode &&
      destinationAddressForm?.country
    ) {
      return true;
    }

    return false;
  })();
  const isUpfitShipThruFormFilled = (() => {
    if (!newQuoteById) return false;

    const { shipThruDetailsForm } = newQuoteById;

    if (
      shipThruDetailsForm?.upfit?.address &&
      shipThruDetailsForm?.upfit?.city &&
      shipThruDetailsForm?.upfit?.state &&
      shipThruDetailsForm?.upfit?.zipCode &&
      shipThruDetailsForm?.upfit?.country
    ) {
      return true;
    }

    return false;
  })();
  const isAccessoriesShipThruFormFilled = (() => {
    if (!newQuoteById) return false;

    const { shipThruDetailsForm } = newQuoteById;

    if (
      shipThruDetailsForm?.accessories?.address &&
      shipThruDetailsForm?.accessories?.city &&
      shipThruDetailsForm?.accessories?.state &&
      shipThruDetailsForm?.accessories?.zipCode &&
      shipThruDetailsForm?.accessories?.country
    ) {
      return true;
    }

    return false;
  })();
  const isChargerShipThruFormFilled = (() => {
    if (!newQuoteById) return false;

    const { shipThruDetailsForm } = newQuoteById;

    if (
      shipThruDetailsForm?.charger?.address &&
      shipThruDetailsForm?.charger?.city &&
      shipThruDetailsForm?.charger?.state &&
      shipThruDetailsForm?.charger?.zipCode &&
      shipThruDetailsForm?.charger?.country
    ) {
      return true;
    }

    return false;
  })();

  //   {
  //     dealerDetails: user!,
  //     filters: [
  //       {
  //         filterType: "equalsFilter",
  //         filterElement: "system.id",
  //         filterValue: String(newQuoteById?.kontentAi__quoteId),
  //       },
  //     ],
  //     depth: 2,
  //   },
  //   {
  //     refetchOnMountOrArgChange: true,
  //     skip: !newQuoteById?.kontentAi__quoteId,
  //   },
  // );

  const getOrderQueryState = useGetSingleQuoteQuery(
    {
      id: createdQuoteId as string,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !quoteId,
    },
  );

  const { updateQuoteAndBomFileLinksInQuote } = useQuoteMethods();

  const { bomPdfCommonProps } = useBomPdfProps({
    order: newQuoteById,
    group: selectedGroup,
    user: user!,
  });

  console.log(
    "main customizationOptions",
    bomPdfCommonProps.customizationOptions,
  );

  const QuotePdf = useMemo(
    () => <BomPDF {...bomPdfCommonProps} />,
    [bomPdfCommonProps],
  );
  const BomPdf = useMemo(
    () => <BomPDF {...bomPdfCommonProps} useBomText />,
    [bomPdfCommonProps],
  );

  const { quotePdfBlob, bomPdfBlob } = usePdfsBlobs({
    QuotePdf,
    BomPdf,
  });

  const shouldEnableGetGeneralForSpecSheetQuery = quotePdfBlob && specSheetUrl;
  const getGeneralForSpecSheetQueryState = useGetGeneralQuery(
    {
      url: String(specSheetUrl),
      dontUseBaseUrl: true,
      responseType: "arraybuffer",
    },
    {
      skip: !shouldEnableGetGeneralForSpecSheetQuery,
    },
  );

  const [isUpdatingQuote, setIsUpdatingQuote] = useState<boolean>(true);
  const [, setPdfsWidth] = useState<number | null>(null);
  // const [pdfsHeight, setPdfsHeight] = useState<number | null>(null);
  const [specSheet, setSpecSheet] = useState<null | ArrayBuffer>(null);
  const [noOfSpecSheetPages, setNoOfSpecSheetPages] = useState<number>(0);
  const [
    customizationOptionsTableRowCount,
    setCustomizationOptionsTableRowCount,
  ] = useState<number>(0);

  const [warrantyDoc] = useState<null | ArrayBuffer>(null);
  const [fullPdfBlob, setFullPdfBlob] = useState<Blob | null>(
    shouldEnableGetGeneralForSpecSheetQuery ? null : quotePdfBlob,
  );
  const [
    isIncompleteCustomerInfoModalOpen,
    setIsIncompleteCustomerInforModalOpen,
  ] = useState<boolean>(false);
  const [
    shouldUpdateQuoteAndBomLinksInQuote,
    setShouldUpdateQuoteAndBomLinksInQuote,
  ] = useState<boolean>(false);

  // const blocker = useBlocker(() => !isCustomerFormFilled);
  // useEffect(() => {
  //   if (blocker?.state === "blocked") {
  //     setIsIncompleteCustomerInforModalOpen(true);
  //     blocker.reset();
  //   }
  // }, [blocker]);

  useEffect(() => {
    const localOptions = bomPdfCommonProps?.customizationOptions?.filter(
      (option) => option?.sectionTitle,
    );
    setCustomizationOptionsTableRowCount(localOptions.length);
  }, [bomPdfCommonProps?.customizationOptions]);

  useEffect(() => {
    if (!shouldEnableGetGeneralForSpecSheetQuery) {
      setFullPdfBlob(quotePdfBlob);
    } else {
      // If 'quotePdfBlob' is updated, we need to update 'fullPdfBlob' too, but since according to condition, if 'fullPdfBlob' is already set, it will not be set again. Hence it's set to 'null' here to trigger resetting
      setFullPdfBlob(null);
    }
  }, [quotePdfBlob, shouldEnableGetGeneralForSpecSheetQuery]);

  useEffect(() => {
    if (
      getGeneralForSpecSheetQueryState.isSuccess &&
      !getGeneralForSpecSheetQueryState.isFetching &&
      getGeneralForSpecSheetQueryState?.data
    ) {
      const obtainedPdfInArrayBuffer =
        getGeneralForSpecSheetQueryState?.data as ArrayBuffer;

      if (!obtainedPdfInArrayBuffer) {
        setFullPdfBlob(quotePdfBlob);

        return;
      }

      setSpecSheet(obtainedPdfInArrayBuffer);
    }
  }, [
    getGeneralForSpecSheetQueryState?.data,
    getGeneralForSpecSheetQueryState.isFetching,
    getGeneralForSpecSheetQueryState.isSuccess,
    quotePdfBlob,
  ]);

  useEffect(() => {
    if (
      newQuoteById?.quotationId &&
      quotePdfBlob &&
      specSheet &&
      !fullPdfBlob
    ) {
      (async () => {
        const combinePDFs = async (blob: Blob, quotationId: string) => {
          const pdfBlobArrayBuffer = await blob.arrayBuffer();

          const pdf1 = await PDFDocument.load(pdfBlobArrayBuffer);
          const pdf2 = await PDFDocument.load(specSheet);

          const mergedPdf = await PDFDocument.create();
          mergedPdf.setTitle(`Request for Quote: ${quotationId}`);

          const quotePdfPages = await mergedPdf.copyPages(
            pdf1,
            pdf1.getPageIndices(),
          );
          const specSheetPdfPages = await mergedPdf.copyPages(
            pdf2,
            pdf2.getPageIndices(),
          );
          setNoOfSpecSheetPages(pdf2.getPageIndices().length);

          const specSheetWidth = specSheetPdfPages[0].getWidth();
          setPdfsWidth(specSheetWidth);

          // Add first page of 'Quote PDF'
          mergedPdf.addPage(quotePdfPages[0]).setWidth(specSheetWidth);
          // Add Spec Sheet
          specSheetPdfPages.forEach((page) => mergedPdf.addPage(page));
          // Add rest of the pages of 'Quote PDF'
          quotePdfPages
            .slice(1)
            .forEach((page) =>
              mergedPdf.addPage(page).setWidth(specSheetWidth),
            );

          const mergedPdfFile = await mergedPdf.save();

          const combinedBlob = new Blob([mergedPdfFile], {
            type: "application/pdf",
          });

          return combinedBlob;
        };

        const combinedPdfBlob = await combinePDFs(
          quotePdfBlob,
          String(newQuoteById?.quotationId),
        );

        setFullPdfBlob(combinedPdfBlob);
      })();
    }
  }, [
    fullPdfBlob,
    newQuoteById?.quotationId,
    quotePdfBlob,
    specSheet,
    warrantyDoc,
  ]);

  const isShouldUpdateQuoteAndBomLinksEffectAlreadyRun = useRef<boolean>(false);

  console.log("main quote", newQuoteById);

  useEffect(() => {
    (async () => {
      console.log(
        "inspections 10",
        shouldUpdateQuoteAndBomLinksInQuote,
        newQuoteById?.customerDetailsForm?.name,
        bomPdfBlob,
        fullPdfBlob,
        !isShouldUpdateQuoteAndBomLinksEffectAlreadyRun.current,
      );

      if (
        shouldUpdateQuoteAndBomLinksInQuote &&
        newQuoteById?.customerDetailsForm?.name &&
        bomPdfBlob &&
        fullPdfBlob &&
        !isShouldUpdateQuoteAndBomLinksEffectAlreadyRun.current
      ) {
        isShouldUpdateQuoteAndBomLinksEffectAlreadyRun.current = true;

        await updateQuoteAndBomFileLinksInQuote({
          updatedId: createdQuoteId as string,
          quotationId: String(newQuoteById?.quotationId),
          bomPdfBlob,
          fullPdfBlob,
        });

        triggerToast({
          variant: "success",
          message: "Customer information saved successfully!",
        });

        setShouldUpdateQuoteAndBomLinksInQuote(false);
      }
    })();
  }, [
    bomPdfBlob,
    createdQuoteId,
    fullPdfBlob,
    newQuoteById?.customerDetailsForm?.name,
    newQuoteById?.quotationId,
    shouldUpdateQuoteAndBomLinksInQuote,
    triggerToast,
    updateQuoteAndBomFileLinksInQuote,
  ]);

  const arePdfFilesUpdated = useRef<boolean>(false);
  const isAlreadyRun = useRef<boolean>(false);
  const dontRunEver = useRef<boolean>(false);
  useEffect(() => {
    if (dontRunEver.current) return;

    (async () => {
      if (!isCustomerFormFilled) {
        dontRunEver.current = true;
        setIsUpdatingQuote(false);
        return;
      }

      // After quote is generated and already created customer was selected, update QUOTE and BOM Pdfs links in 'Quote' item, since data needed by Pdfs (customer information) is already present
      if (
        fullPdfBlob &&
        bomPdfBlob &&
        !arePdfFilesUpdated.current &&
        getOrderQueryState.isSuccess &&
        getOrderQueryState?.data?.data
      ) {
        try {
          const theQuote = getOrderQueryState?.data?.data;
          const bomFileLink = theQuote?.bom?.fileLink;
          const quoteFileLink = theQuote?.quote?.fileLink;

          const areBothFilesAlreadyUploaded =
            ![null, undefined, ""].includes(bomFileLink) &&
            ![null, undefined, ""].includes(quoteFileLink);

          if (areBothFilesAlreadyUploaded) {
            arePdfFilesUpdated.current = true;
            return;
          }

          if (!isAlreadyRun.current) {
            isAlreadyRun.current = true;

            await updateQuoteAndBomFileLinksInQuote({
              updatedId: createdQuoteId as string,
              quotationId: String(newQuoteById?.quotationId),
              bomPdfBlob,
              fullPdfBlob,
              updateThis: bomFileLink ? "quote" : quoteFileLink ? "bom" : "all",
            });
          }

          arePdfFilesUpdated.current = true;
        } catch (error) {
          console.log("some error", error);
          isAlreadyRun.current = false;
        }
      }

      setIsUpdatingQuote(false);
    })();
  }, [
    bomPdfBlob,
    getOrderQueryState?.data?.data,
    getOrderQueryState.isSuccess,
    newQuoteById.kontentAi__quoteId,
    newQuoteById.kontentAi__quoteIds,
    newQuoteById?.quotationId,
    fullPdfBlob,
    isCustomerFormFilled,
    updateQuoteAndBomFileLinksInQuote,
    createdQuoteId,
  ]);

  useEffect(() => {
    return () => {
      // Reset ref when component is unmounted
      isAlreadyRun.current = false;
    };
  }, []);

  const onPrintQuotePdfClick = useCallback((pdfBlob: Blob) => {
    if (!pdfBlob) return;

    const objectUrl = window.URL.createObjectURL(pdfBlob);
    // window.open(objectUrl)?.print();

    const IFRAME_ELEM_ID = "iframe-for-preview-quote-print";
    let iframeElem = document.getElementById(
      IFRAME_ELEM_ID,
    ) as HTMLIFrameElement;
    if (!iframeElem) {
      iframeElem = document.createElement("iframe");
      iframeElem.id = IFRAME_ELEM_ID;
      iframeElem.name = IFRAME_ELEM_ID;
      document.body.appendChild(iframeElem);
    }
    iframeElem.src = objectUrl;

    //@ts-ignore
    const frameInDom = window.frames[IFRAME_ELEM_ID] as Window;
    setTimeout(() => {
      frameInDom.focus();
      frameInDom.print();
    }, 1000);
  }, []);

  const providerValue = useMemo(
    () => ({
      quoteId,
      newQuoteById,
      selectedGroup,
      QuotePdf,
      BomPdf,
      onPrintQuotePdfClick,
      quotePdfBlob,
      bomPdfBlob,
      isCustomerFormFilled,
      isUpfitShipThruFormFilled,
      isAccessoriesShipThruFormFilled,
      isChargerShipThruFormFilled,
      fullPdfBlob,
      noOfSpecSheetPages,
      getGeneralForSpecSheetQueryState,
      isDestinationAddressFormFilled,
      setShouldUpdateQuoteAndBomLinksInQuote,
      shouldUpdateQuoteAndBomLinksInQuote,
      customizationOptionsTableRowCount,
    }),
    [
      quoteId,
      newQuoteById,
      selectedGroup,
      QuotePdf,
      BomPdf,
      onPrintQuotePdfClick,
      quotePdfBlob,
      bomPdfBlob,
      isCustomerFormFilled,
      isUpfitShipThruFormFilled,
      isAccessoriesShipThruFormFilled,
      isChargerShipThruFormFilled,
      fullPdfBlob,
      noOfSpecSheetPages,
      getGeneralForSpecSheetQueryState,
      isDestinationAddressFormFilled,
      shouldUpdateQuoteAndBomLinksInQuote,
      customizationOptionsTableRowCount,
    ],
  );

  return (
    <>
      {isUpdatingQuote && (
        <PageLoader
          useOverlay
          loadingText="Please wait while your quote is being generated..."
        />
      )}
      <QuotationSummaryPageContext.Provider value={providerValue}>
        {props.children}
      </QuotationSummaryPageContext.Provider>

      {isIncompleteCustomerInfoModalOpen && (
        <IncompleteCustomerInfoModal
          isOpen={isIncompleteCustomerInfoModalOpen}
          onClose={() => {
            setIsIncompleteCustomerInforModalOpen(false);
          }}
        />
      )}
    </>
  );
}
