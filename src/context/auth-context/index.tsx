import { useContext } from "react";

import { AuthContextFactory } from "./auth-context";

export const useAuthContextValue = () => useContext(AuthContextFactory);
