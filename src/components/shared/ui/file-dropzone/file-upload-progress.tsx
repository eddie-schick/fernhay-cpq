import { styled } from "@mui/material";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

import MuiBox from "../../mui-box/mui-box";

export default function FileUploadProgress({ progress }: { progress: number }) {
  // React.useEffect(() => {
  //   if (progress < 100) {
  //     const timer = setTimeout(() => {
  //       setProgress((prevProgress) => prevProgress + 1);
  //     }, 30);

  //     return () => {
  //       clearTimeout(timer);
  //     };
  //   }
  // }, [progress, setProgress]);

  return (
    <MuiBox sx={{ width: "100%" }}>
      <MuiBox sx={{ display: "flex", alignItems: "center" }}>
        <MuiBox sx={{ width: "100%", mr: 1 }}>
          <BorderLinearProgress variant="determinate" value={progress} />
        </MuiBox>
      </MuiBox>
    </MuiBox>
  );
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: "0.3125rem",
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.custom.tertiary,
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary.main,
  },
}));
