import ExcludeComponents from "./Excluder";
import FreeChatIncludeSettings from "./FreeChat";
import PlatformComponent from "./Platform";
import TimezoneSettings from "./Timezone";

const SettingsComponent = {
    Excluder: ExcludeComponents,
    FreeChat: FreeChatIncludeSettings,
    Platform: PlatformComponent,
    Timezone: TimezoneSettings,
};

export default SettingsComponent;
