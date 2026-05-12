import React, { createContext, useContext, useState } from "react";

export type screenType = "list" | "add" | "edit";
interface Screen {
  current: screenType;
  previous: screenType | null;
}
type ScreenContextType = {
  screen: {
    current: screenType;
    previous: screenType | null;
  };
  setScreen: React.Dispatch<React.SetStateAction<Screen>>;
};

const ScreenContext = createContext<ScreenContextType>({
  screen: {
    current: "list",
    previous: null,
  },
  setScreen: () => {},
});
export const ScreenProvider = ({ children }: { children: React.ReactNode }) => {
  const [screen, setScreen] = useState<Screen>({
    current: "list",
    previous: null,
  });

  return (
    <ScreenContext.Provider value={{ screen, setScreen }}>
      {children}
    </ScreenContext.Provider>
  );
};
export const useScreen = () => {
  const context = useContext(ScreenContext);

  return context;
};
