import ExcludeComponents from "./Excluder";
import FreeChatIncludeSettings from "./FreeChat";
import LivesSortSettings from "./LivesSort";
import PlatformComponent from "./Platform";
import TimezoneSettings from "./Timezone";

const SettingsComponent = {
    Excluder: ExcludeComponents,
    FreeChat: FreeChatIncludeSettings,
    LivesSort: LivesSortSettings,
    Platform: PlatformComponent,
    Timezone: TimezoneSettings,
};

export default SettingsComponent;
