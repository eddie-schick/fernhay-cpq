import { createContext, useCallback, useEffect, useState } from "react";

import LocalStorageKeys from "~/constants/local-storage-keys";

import { persistor } from "~/store";
import { useGetUserQuery } from "~/store/endpoints/auth/auth";

type Props = {
  children: React.ReactNode;
};

export type UserSchema = {
  user: {
    id: string | number;
    email: string;
    appId?: number;
    created_at?: string;
    deleted_at?: string | null;
    username?: string;
    issuedToken?: string | null;
    name: string;
    magicLinkToken?: string;
    phone?: string;
    updated_at?: string;
    resetPasswordExpires?: string | number;
    resetPasswordToken?: string;
    sourceId?: string | number;
    profile?: string | null;
    metadata?: {
      dealer_address: string;
      dealership_name: string;
      dealer_city: string;
      dealer_state: string;
      dealer_zip_code: string;
      job_title: string;
      image?: string;
      company_logo?: File;
      company_logo_url?: string;
      role?: string;
    };
  };
};
type InitialValuesType = {
  isAuth: boolean;
  isAuthLoaded: boolean;
  onAuthUsertoLogin: (token: string) => void;
  onAuthUsertoLogout: () => void;
  user: null | UserSchema;
  setUser: React.Dispatch<React.SetStateAction<UserSchema | null>> | null;
  token: string | null;
  role: string;
};
const initialValue: InitialValuesType = {
  isAuth: false,
  isAuthLoaded: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAuthUsertoLogin: (token: string) => {},
  onAuthUsertoLogout: () => {},
  user: null,
  setUser: null,
  token: null,
  role: "",
};

export const AuthContextFactory = createContext(initialValue);

function AuthContextProvider({ children }: Props) {
  const searchParams = window.location.search;
  const isTokenInParams = searchParams?.includes("token");

  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);
  const [user, setUser] = useState<UserSchema | null>(null);
  const [token, setToken] = useState<string | null>(null);

  console.log("%c-auth-context:", "background-color:yellow;", {
    searchParams,
    isTokenInParams,
  });

  useGetUserQuery(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      skip: !token,
    },
  );

  const onAuthUsertoLogin = useCallback((tokenValue: string) => {
    try {
      const decodedToken = JSON.parse(
        atob(tokenValue.split(".")[1]),
      ) as UserSchema;
      console.log("decodedToken", { decodedToken });

      setIsAuth(true);

      setUser(
        //@ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        JSON.parse(localStorage.getItem(LocalStorageKeys.USER)) || decodedToken,
      );
      setToken(tokenValue);

      localStorage.setItem(LocalStorageKeys.TOKEN, tokenValue);
      localStorage.setItem(
        LocalStorageKeys.USER,
        localStorage.getItem(LocalStorageKeys.USER) ||
          JSON.stringify(decodedToken),
      );
    } catch (error) {
      // Handle any potential errors (e.g., invalid token) here
      console.error("Error:", error);
    } finally {
      setIsAuthLoaded(true);
    }
  }, []);

  const onAuthUsertoLogout = async (): Promise<void> => {
    await persistor.flush().then(() => {
      return persistor.purge();
    });
    localStorage.removeItem(LocalStorageKeys.TOKEN);
    localStorage.removeItem(LocalStorageKeys.USER);
    setIsAuth(false);
  };

  useEffect(() => {
    if (isTokenInParams) {
      // Token handling will be done in login page component so we can set `setIsAuthLoaded` to `true`
      setIsAuthLoaded(true);
      return;
    }

    const tokenFromLocalStorage: string | null = localStorage.getItem(
      LocalStorageKeys.TOKEN,
    );
    if (tokenFromLocalStorage) {
      onAuthUsertoLogin(tokenFromLocalStorage);

      return;
    }

    setIsAuthLoaded(true);
  }, [isTokenInParams, onAuthUsertoLogin]);

  return (
    <AuthContextFactory.Provider
      value={{
        isAuth,
        isAuthLoaded,
        onAuthUsertoLogin,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onAuthUsertoLogout,
        user,
        setUser,
        token,
        role: user?.user?.metadata?.role || "user",
      }}
    >
      {children}
    </AuthContextFactory.Provider>
  );
}

export default AuthContextProvider;
