import { PDFDocument } from "pdf-lib";
import { v4 as uuidv4 } from "uuid";

import { NewQuoteShape } from "~/store/slices/quotes/types";

const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const preventNonNumericalInput = (
  e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>,
) => {
  e = e || window.event;

  const keyValue = e.key;

  if (
    !keyValue.match(/^[0-9]*\.?[0-9]*$/) &&
    ![
      "Backspace",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
    ].includes(keyValue) &&
    !e.ctrlKey
  )
    e.preventDefault();
};

export const customRegexInputPass = (
  e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>,
  regexExp: RegExp,
) => {
  if (!regexExp) return;
  e = e || window.event;

  const keyValue = e.key;

  console.log("newst", e.key, regexExp);
  if (
    !keyValue.match(regexExp) &&
    ![
      "Backspace",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
    ].includes(keyValue) &&
    !e.ctrlKey
  )
    e.preventDefault();
};

export const preventNumericalInputWithHyphens = (
  e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>,
) => {
  e = e || window.event;

  const keyValue = e.key;

  if (
    !keyValue.match(/^[a-zA-Z\s-]+$/) &&
    ![
      "Backspace",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
    ].includes(keyValue) &&
    !e.ctrlKey
  )
    e.preventDefault();
};

export const combinePDFsAndReturnBlob = async (
  pdfsArrayBuffers: ArrayBuffer[],
) => {
  const loadedPdfs = [];
  for (let i = 0; i < pdfsArrayBuffers?.length; i += 1) {
    const pdfArrayBuf = pdfsArrayBuffers[i];

    const pdf = await PDFDocument.load(pdfArrayBuf);
    loadedPdfs.push(pdf);
  }

  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < loadedPdfs?.length; i += 1) {
    const pdf = loadedPdfs[i];

    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfFile = await mergedPdf.save();
  const combinedBlob = new Blob([mergedPdfFile], {
    type: "application/pdf",
  });

  return combinedBlob;
};

export function getLocaleFormattedNumber(
  num: number | undefined,
  noOfFractions?: number,
) {
  if (num === null || num === undefined) return null;

  return num.toLocaleString(undefined, {
    maximumFractionDigits:
      noOfFractions === 0 ? 0 : noOfFractions ? noOfFractions : 0,
    minimumFractionDigits:
      noOfFractions === 0 ? 0 : noOfFractions ? noOfFractions : 0,
  });
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader?.result as string);
    reader.readAsDataURL(blob);
  });
}

export default function getBuildLeadTimeFromTimeGivenInDays(
  timeInDays: number | undefined,
) {
  if (!timeInDays) return null;

  if (timeInDays < 7) {
    return `${timeInDays} day${timeInDays > 1 ? "s" : ""}`;
  }
  let timeInWeeks = Math.trunc(timeInDays / 7);
  const daysModuloByWeek = timeInDays % 7;
  const areDaysModuloByWeekEqualToZero = daysModuloByWeek === 0;
  if (!areDaysModuloByWeekEqualToZero) {
    // Round up days to a week
    timeInWeeks++;
  }

  const weekPart = `${timeInWeeks} week${timeInWeeks > 1 ? "s" : ""}`;
  // const dayPart = areDaysModuloByWeekEqualToZero
  // 	? ""
  // 	: ` ${daysModuloByWeek} day${daysModuloByWeek > 1 ? "s" : ""}`;

  // return `${weekPart}${dayPart}`;
  return `${weekPart}`;
}

export const formatPhoneNumber = (
  phoneNumber: string,
  format: string | undefined,
): string => {
  const cleaned = phoneNumber.replace(/\D/g, "");
  if (format) {
    let formatted = "";
    let digitIndex = 0;
    for (let i = 0; i < format.length; i++) {
      if (format[i] === ".") {
        formatted +=
          cleaned[digitIndex] !== undefined ? cleaned[digitIndex] : "";
        digitIndex++;
      } else {
        formatted += format[i];
      }
    }
    return formatted;
  } else {
    return "Invalid phone number";
  }
};

export function toSentenceCase(str: string) {
  if (!str) {
    return "";
  }

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function toTitleCase(str: string) {
  let titleCaseStr = str.replace(/([a-z])([A-Z])/g, "$1 $2");
  titleCaseStr = titleCaseStr.replace(/\b\w/g, (match) => match.toUpperCase());
  return titleCaseStr;
}
export const getFormattedPhoneNumber = (
  phoneNo: string | undefined,
  country: string = "us",
) => {
  if (!phoneNo) return "";

  const last4Digits = phoneNo?.slice(-4, phoneNo.length);
  const last3Before4 = phoneNo?.slice(-7, -4);
  switch (country) {
    case "us":
    default: {
      const countryCode = phoneNo?.slice(0, 2);
      const threeDigitsAfterCountryCode = phoneNo?.slice(2, 5);

      const final = `${countryCode} (${threeDigitsAfterCountryCode}) ${last3Before4}-${last4Digits}`;
      return final;
    }
  }
};

export function downloadFile(fileBlob: Blob, fileName: string) {
  const anchor = document.createElement("a");
  const blobLink = URL.createObjectURL(fileBlob);
  anchor.download = fileName;
  anchor.href = blobLink;
  anchor.click();
  URL.revokeObjectURL(blobLink);
}

export function camelCaseToSpaces(input: string) {
  const spaced = input.replace(/([A-Z])/g, " $1");
  const lowercased = spaced.toLowerCase();
  return lowercased.trim();
}

export function getFormDataForSharePdfByEmail(quote: NewQuoteShape) {
  const formData = new FormData();

  formData.append("customerEmail", quote?.customerDetailsForm?.email);
  formData.append("quoteNo", String(quote?.quotationId));

  return formData;
}

// 'generateRandomVIN' by ChatGPT
export function generateRandomVIN() {
  let vin = "";

  // First character: Must be a digit
  vin += characters.charAt(Math.floor(Math.random() * 10));

  // Remaining 16 characters: Can be alphanumeric
  for (let i = 0; i < 16; i++) {
    vin += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return vin;
}

export function fileNameFormatter(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  let name = fileName;
  let extension = "";

  if (lastDotIndex !== -1) {
    name = fileName.substring(0, lastDotIndex);
    extension = fileName.substring(lastDotIndex);
  }

  const fileNameWithoutSpecialCharacters = name.replace(/[^a-zA-Z0-9]/g, "");

  const UUIDString = uuidv4();

  const finalFileName = `${fileNameWithoutSpecialCharacters}_${UUIDString}${extension || ".png"}`;
  return finalFileName;
}
