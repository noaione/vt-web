import React from "react";
import { connect, ConnectedProps } from "react-redux";

function simpleDebounce<T extends (...args: any) => ReturnType<T>>(fn: T, wait: number) {
    let timeoutFunc: NodeJS.Timeout;
    return (...args: any) => {
        clearTimeout(timeoutFunc);
        timeoutFunc = setTimeout(() => {
            fn(...args);
        }, wait);
    };
}

const channelsDispatch = {
    searchQuery: (payload: string) => ({ type: "channels/searchQuery", payload }),
};
const videosDispatch = {
    searchQuery: (payload: string) => ({ type: "videos/searchQuery", payload }),
};
const channelsConnector = connect(null, channelsDispatch);
const videosConnector = connect(null, videosDispatch);
type PropsFromRedux = ConnectedProps<typeof channelsConnector>;

interface SearchBoxState {
    query: string;
}

class SearchBoxComponent extends React.Component<PropsFromRedux, SearchBoxState> {
    debouncer: (...args: any) => void;

    constructor(props: PropsFromRedux) {
        super(props);
        this.dispatchActual = this.dispatchActual.bind(this);
        this.debouncer = simpleDebounce(this.dispatchActual, 300);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            query: "",
        };
    }

    dispatchActual(data: string) {
        this.props.searchQuery(data);
    }

    handleChange(query: string) {
        this.setState({ query });
        this.debouncer(query);
    }

    render() {
        return (
            <div className="flex flex-col gap-1 ml-2">
                <div className="text-gray-300 font-semibold">Search</div>
                <input
                    type="text"
                    value={this.state.query}
                    onChange={(e) => this.handleChange(e.target.value)}
                    className="form-input w-full md:w-1/2 lg:w-1/3 mt-1 bg-gray-700 rounded-lg border-gray-700 hover:border-gray-400 focus:hover:border-blue-500 transition duration-200"
                />
            </div>
        );
    }
}

const ChannelsSearchBoxComponent = channelsConnector(SearchBoxComponent);
const VideosSearchBoxComponent = videosConnector(SearchBoxComponent);
export { ChannelsSearchBoxComponent, VideosSearchBoxComponent };
