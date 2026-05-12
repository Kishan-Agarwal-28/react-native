import { Stack } from "expo-router";
import { ThemeProvider } from "../../lib/theme_context";
import { ScreenProvider } from "../../lib/screen_context";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ScreenProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </ScreenProvider>
    </ThemeProvider>
  );
}
