import { createContext, useContext, useMemo, useState } from "react";
import type { CITIES } from "@/lib/data";

type City = (typeof CITIES)[number];

type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  orders: number;
  rating: number;
  points: number;
};

type LocationSelection = {
  mode: "city" | "pincode";
  label: string;
  city?: City;
  pincode?: string;
};

type SignInPayload = {
  name?: string;
  email: string;
};

type AppContextType = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  location: LocationSelection | null;
  signIn: (payload: SignInPayload) => void;
  signUp: (payload: SignInPayload) => void;
  signOut: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setLocation: (next: LocationSelection) => void;
  clearLocation: () => void;
};

const AppContext = createContext<AppContextType>({
  user: null,
  isAuthenticated: false,
  location: null,
  signIn: () => {},
  signUp: () => {},
  signOut: () => {},
  updateUser: () => {},
  setLocation: () => {},
  clearLocation: () => {},
});

const buildUserProfile = ({ name, email }: SignInPayload): UserProfile => {
  const safeName = name?.trim() || email.split("@")[0] || "Guest";
  return {
    id: `user-${Date.now()}`,
    name: safeName
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
    email,
    orders: 24,
    rating: 4.9,
    points: 120,
  };
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [location, setLocation] = useState<LocationSelection | null>(null);

  const signIn = (payload: SignInPayload) => {
    setUser(buildUserProfile(payload));
  };

  const signUp = (payload: SignInPayload) => {
    setUser(buildUserProfile(payload));
  };

  const signOut = () => {
    setUser(null);
    setLocation(null);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const clearLocation = () => {
    setLocation(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      location,
      signIn,
      signUp,
      signOut,
      updateUser,
      setLocation,
      clearLocation,
    }),
    [user, location],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
