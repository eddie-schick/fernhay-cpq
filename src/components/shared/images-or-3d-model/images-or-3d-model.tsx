import { useEffect, useRef, useState } from "react";
import { FreeMode, Navigation, Thumbs } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as TSwiper } from "swiper/types";

import {
  Box,
  Typography,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import Close from "@mui/icons-material/Close";

import {
  ExitFullscreenIcon,
  FullscreenIconSvg,
  Icon3dSvg,
  NavigateBackPNG,
  NavigateNextPNG,
} from "~/global/icons";

import { NewQuoteShape } from "~/store/slices/quotes/types";

import Model3dModal from "../model-3d-modal/model-3d-modal";
import MuiBox from "../mui-box/mui-box";

type SvgType = {
  src: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  type: "svg";
};
type ImageType = {
  src: string;
  type: "image";
};
type ImagesOr3dModelProps = {
  selectedGroup?: NewQuoteShape["groups"][number];
  images?: (SvgType | ImageType)[];
  selectedImageIndex?: number;
  showThumbs?: boolean;
  slidesPerView?: number;
};
export default function ImagesOr3dModel(props: ImagesOr3dModelProps) {
  const {
    selectedGroup,
    images,
    selectedImageIndex,
    showThumbs,
    slidesPerView,
  } = props;
  if ((selectedImageIndex || -1) >= (images?.length || 0)) {
    throw new Error(
      "The `selectedImageIndex` is greater than the length of the array.",
    );
  }

  console.log("vec images are", images);

  const chassisOption = selectedGroup?.configurationSections
    ?.find((configSection) => configSection?.title?.toLowerCase() === "chassis")
    ?.options?.find((configOption) => configOption?.is_selected);
  const upfitOption = selectedGroup?.configurationSections
    ?.find((configSection) => configSection?.title?.toLowerCase() === "upfit")
    ?.options?.find((configOption) => configOption?.is_selected);

  const mainRef = useRef<null | HTMLDivElement>(null);

  const [thumbsSwiper, setThumbsSwiper] = useState<TSwiper | null>(null);
  const [isFullscreenEnabled, setIsFullscreenEnabled] =
    useState<boolean>(false);
  const [isModel3dModalOpen, setIsModel3dModalOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [galleryIndex, setGalleryIndex] = useState<number>(0);

  const has3dModel = Boolean(chassisOption?.model_3d?.url || upfitOption?.model_3d?.url);

  // Collect all configuration option images for the gallery
  const allConfigImages: { src: string; label: string }[] = [];
  selectedGroup?.configurationSections?.forEach((section) => {
    section?.options?.forEach((option) => {
      if (option?.is_selected && option?.additional_images) {
        option.additional_images.forEach((img) => {
          if (img?.url) {
            allConfigImages.push({ src: img.url, label: option.title || section.title || "" });
          }
        });
      }
    });
  });

  useEffect(() => {
    //@ts-ignore
    const fullscreenChangeHandler = () => {
      if (!document.fullscreenElement) {
        setIsFullscreenEnabled(false);
      }
    };

    document.addEventListener("fullscreenchange", fullscreenChangeHandler);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChangeHandler);
    };
  }, []);

  const onFullscreenIconClick = () => {
    const mainRefElement = mainRef.current;
    if (mainRefElement) {
      if (!document.fullscreenElement) {
        void mainRefElement.requestFullscreen().then(() => {
          setIsFullscreenEnabled(true);
        });
      } else if (document.exitFullscreen) {
        void document.exitFullscreen().then(() => {
          setIsFullscreenEnabled(false);
        });
      }
    }
  };

  return (
    <ImagesOr3dModelStyled
      className="images-or-3d-model"
      ref={mainRef}
      showThumbs={showThumbs}
      isFullscreenEnabled={isFullscreenEnabled}
    >
      {!images || !images?.length ? (
        <MuiBox sx={{ paddingTop: "5rem", textAlign: "center" }}>
          <Typography>No Images Found!</Typography>
        </MuiBox>
      ) : (
        <MuiBox className="sliders-container">
          <Swiper
            navigation={true}
            thumbs={{
              swiper:
                thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
            }}
            modules={[FreeMode, Navigation, Thumbs]}
            className="vehicle-images__swiper"
          >
            {images?.map((imageObj, index) => {
              return (
                <SwiperSlide key={index}>
                  {imageObj?.type === "svg" ? (
                    <imageObj.src />
                  ) : (
                    <img
                      src={imageObj?.src}
                      className="swiper__vehicle-main-image"
                    />
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>

          {showThumbs && (
            <Swiper
              onSwiper={setThumbsSwiper}
              slidesPerView={slidesPerView || 8}
              spaceBetween={10}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="vehicle-images__swiper-thumbs"
              breakpoints={{
                900: {
                  slidesPerView: slidesPerView || 7,
                },
                600: {
                  slidesPerView: slidesPerView || 5,
                },
                400: {
                  slidesPerView: slidesPerView || 4,
                },
                300: {
                  slidesPerView: slidesPerView || 3,
                },
              }}
            >
              {images?.map((imageObj, index) => {
                return (
                  <SwiperSlide
                    key={index}
                    style={{
                      width: "4rem !important",
                    }}
                  >
                    {imageObj?.type === "svg" ? (
                      <imageObj.src />
                    ) : (
                      <img
                        src={imageObj?.src}
                        className="swiper__thumb-image"
                      />
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </MuiBox>
      )}

      <MuiBox className="icons-container">
        {isFullscreenEnabled ? (
          <ExitFullscreenIcon
            className="icon-fullscreen"
            onClick={onFullscreenIconClick}
          />
        ) : (
          <>
            <Icon3dSvg
              id="icon-3d"
              className="icon-3d"
              onClick={() => {
                if (has3dModel) {
                  setIsModel3dModalOpen(true);
                } else {
                  setGalleryIndex(0);
                  setIsGalleryOpen(true);
                }
              }}
            />
            <FullscreenIconSvg
              id="icon-fullscreen"
              className="icon-fullscreen"
              onClick={onFullscreenIconClick}
            />
          </>
        )}
      </MuiBox>

      {isModel3dModalOpen && (
        <Model3dModal
          isOpen={isModel3dModalOpen}
          onClose={() => {
            setIsModel3dModalOpen(false);
          }}
          selectedGroup={selectedGroup!}
        />
      )}

      {isGalleryOpen && (
        <Dialog
          open={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{ sx: { height: "85vh", maxHeight: "85vh" } }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #dbdbdb",
              fontWeight: 700,
              fontSize: "1.25rem",
            }}
          >
            Vehicle Gallery
            {allConfigImages.length > 0 && (
              <Typography component="span" sx={{ ml: 2, fontWeight: 400, fontSize: "0.9rem", color: "#666" }}>
                {galleryIndex + 1} / {allConfigImages.length} — {allConfigImages[galleryIndex]?.label}
              </Typography>
            )}
            <IconButton onClick={() => setIsGalleryOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
              position: "relative",
            }}
          >
            {allConfigImages.length > 0 ? (
              <>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <img
                    src={allConfigImages[galleryIndex]?.src}
                    alt={allConfigImages[galleryIndex]?.label}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "65vh",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                {allConfigImages.length > 1 && (
                  <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap", justifyContent: "center" }}>
                    {allConfigImages.map((img, i) => (
                      <Box
                        key={i}
                        onClick={() => setGalleryIndex(i)}
                        sx={{
                          width: 72,
                          height: 72,
                          border: i === galleryIndex ? "2px solid #204993" : "1px solid #ccc",
                          borderRadius: "4px",
                          cursor: "pointer",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={img.src}
                          alt={img.label}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            ) : (
              <Typography sx={{ color: "#666", fontSize: "1.1rem" }}>
                No configuration images available. Add images to vehicle options to see them here.
              </Typography>
            )}
          </DialogContent>
        </Dialog>
      )}
    </ImagesOr3dModelStyled>
  );
}

const ImagesOr3dModelStyled = styled(Box, {
  shouldForwardProp(propName) {
    return propName !== "showThumbs" && propName !== "isFullscreenEnabled";
  },
})<{ showThumbs?: boolean; isFullscreenEnabled?: boolean }>(
  ({ theme, showThumbs, isFullscreenEnabled }) => ({
    position: "relative",
    maxWidth: "50rem",
    paddingInline: "40px",

    ...(isFullscreenEnabled && {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#ffffff",
    }),

    ".sliders-container": {
      paddingInline: "40px",
      paddingTop: "32px",
      display: "grid",
      position: "relative",
      ...(isFullscreenEnabled && {
        maxWidth: "70rem",
      }),
    },

    ".vehicle-images__swiper": {
      margin: 0,
      position: "initial",
    },

    ".vehicle-images__swiper-thumbs": {
      height: "4rem",
      paddingBottom: "4px",
      paddingRight: "40px",
      margin: 0,
      marginTop: "1.5rem",
    },

    ".swiper__vehicle-main-image": {
      height: "100%",
      width: "100%",
    },

    ".vehicle-images__swiper-thumbs .swiper-wrapper img": {
      objectFit: "contain",
    },

    ".vehicle-images__swiper-thumbs .swiper-wrapper .swiper-slide": {
      width: "4rem !important",
      borderRadius: "0.375rem",
      border: "1px solid #204993",
    },

    ".vehicle-images__swiper-thumbs .swiper-wrapper .swiper-slide:nth-of-type(1)":
      {
        marginLeft: "auto",
      },
    ".vehicle-images__swiper-thumbs .swiper-wrapper .swiper-slide:last-of-type":
      {
        marginRight: "auto !important",
      },

    ".swiper-slide-thumb-active": {
      border: `2px solid #204993 !important`,
      borderRadius: "0.375rem",
    },

    ".swiper__thumb-image": {
      width: "100%",
      height: "100%",
      borderRadius: "0.25rem",
    },

    ".swiper-button-prev": {
      display: showThumbs ? "block" : "none",
      left: 0,
      top: "97%",
      background: `url('${NavigateBackPNG}')`,
      backgroundRepeat: "no-repeat",
      width: "1rem",
      height: "1rem",
      padding: 0,
      borderRadius: 0,
    },
    ".swiper-button-prev::after": {
      all: "unset",
    },

    ".swiper-button-next": {
      display: showThumbs ? "block" : "none",
      right: 0,
      top: "97%",
      background: `url('${NavigateNextPNG}')`,
      backgroundRepeat: "no-repeat",
      width: "1rem",
      height: "1rem",
      padding: 0,
      borderRadius: 0,
    },
    ".swiper-button-next::after": {
      all: "unset",
    },

    ".icons-container": {
      display: "flex",
      alignItems: "center",
      position: "absolute",
      top: 0,
      right: 0,
      gap: "0.5rem",
      ...(isFullscreenEnabled && {
        top: "2rem",
        right: "2rem",
      }),
    },

    ".icon-3d": {
      cursor: "pointer",
    },
    ".icon-3d--disabled": {
      opacity: 0.4,
      pointerEvents: "none",
    },

    ".icon-fullscreen": {
      cursor: "pointer",
    },

    [theme.breakpoints.down("md")]: {
      paddingInline: 0,
    },
  }),
);
