import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Feat1 from "./screens/feature1";
import Feat2 from "./screens/feature2";
import Feat3 from "./screens/feature3";

const Tab = createMaterialTopTabNavigator<OnboardingTabParamList>();

export const OnBoardingLayout = () => {
  return (
    <Tab.Navigator tabBar={() => null} screenOptions={{ swipeEnabled: true }}>
      <Tab.Screen name="feat1" component={Feat1} />
      <Tab.Screen name="feat2" component={Feat2} />
      <Tab.Screen name="feat3" component={Feat3} />
    </Tab.Navigator>
  );
};
