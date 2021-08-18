import { ChannelsPlatformsFilterComponent, VideosPlatformsFilterComponent } from "./Platforms";
import { ChannelsSearchBoxComponent, VideosSearchBoxComponent } from "./SearchBox";

const SearchComponent = {
    Channels: ChannelsSearchBoxComponent,
    Videos: VideosSearchBoxComponent,
};

const PlatformsComponent = {
    Channels: ChannelsPlatformsFilterComponent,
    Videos: VideosPlatformsFilterComponent,
};

const FiltersComponent = {
    Search: SearchComponent,
    Platforms: PlatformsComponent,
};

export default FiltersComponent;
