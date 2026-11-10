import { NativeTabs } from "expo-router/native-tabs";
import { useTheme } from '../../styles/theme';

export default function TabsLayout() {
    const { palette } = useTheme();
    return (
        <NativeTabs tintColor={palette.accent} backgroundColor={palette.surface} indicatorColor="rgba(255, 136, 0, 0.18)"
  rippleColor="rgba(255, 136, 0, 0.3)">
            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon 
                    sf={{ default: 'house', selected: 'house.fill'}}
                    md="home" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="settings">
                <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon 
                    sf={{default: "gearshape", selected: "gearshape.fill"}}
                    md="settings" />
            </NativeTabs.Trigger>
        </NativeTabs>
    )


}