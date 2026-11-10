import { NativeTabs } from "expo-router/native-tabs";

export default function TabsLayout() {
    return (
        <NativeTabs tintColor="#ffff" backgroundColor="#ffffff">
            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon 
                    sf={{ default: 'house', selected: 'house.fill'}}
                    md="home" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="document-viewer">
                <NativeTabs.Trigger.Label>Documents</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon 
                    sf={{default: "doc", selected: "doc.fill"}}
                    md="document" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="settings">
                <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon 
                    sf={{default: "gear", selected: "gear.fill"}}e
                    md="settings" />
            </NativeTabs.Trigger>
        </NativeTabs>
    )


}