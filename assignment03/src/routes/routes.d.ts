// routes.d.ts
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

// ─── Param Lists ───────────────────────────────────────────────────────────────

declare global {
  export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
  };

  export type MainTabParamList = {
    Home: undefined;
    Search: undefined;
    Orders: undefined;
    Profile: undefined;
  };

  export type MainStackParamList = {
    Tabs: NavigatorScreenParams<MainTabParamList>;
    Restaurant: { id: string };
    Cart: undefined;
  };

  export type RootStackParamList = {
    Onboarding: undefined;
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Location: undefined;
    Main: NavigatorScreenParams<MainStackParamList>;
  };
  type OnboardingTabParamList = {
    feat1: undefined;
    feat2: undefined;
    feat3: undefined;
  };
  type SearchStackParamList = {
    Search: { category?: string } | undefined;
    Categories: undefined;
  };
  // ─── Screen Props ─────────────────────────────────────────────────────────────

  export type RootStackScreenProps<T extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, T>;

  export type MainStackScreenProps<T extends keyof MainStackParamList> =
    CompositeScreenProps<
      NativeStackScreenProps<MainStackParamList, T>,
      RootStackScreenProps<"Main">
    >;

  export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
    CompositeScreenProps<
      NativeStackScreenProps<AuthStackParamList, T>,
      RootStackScreenProps<"Auth">
    >;
  export type OnboardingStackScreenProps<
    T extends keyof OnboardingTabParamList,
  > = CompositeScreenProps<
    NativeStackScreenProps<OnboardingTabParamList, T>,
    RootStackScreenProps<"Onboarding">
  >;
  export type LocationScreenProps = RootStackScreenProps<"Location">;
  export type MainTabScreenProps<T extends keyof MainTabParamList> =
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList, T>,
      MainStackScreenProps<"Tabs">
    >;
  export type SearchStackScreenProps<T extends keyof SearchStackParamList> =
    NativeStackScreenProps<SearchStackParamList, T>;
}
