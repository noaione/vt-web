import React from "react";

import Select, { ActionMeta, GroupTypeBase, OptionTypeBase, Styles } from "react-select";
import { isNone } from "../../lib/utils";
import { GROUPS_NAME_MAP } from "../../lib/vt";

import { getLocalStorageData } from "./helper";

interface ExcluderState {
    excludedGroups: any[];
    loaded: boolean;
}

const OPTIONS = Object.entries(GROUPS_NAME_MAP).map(([key, value]) => {
    return {
        label: value,
        value: key,
    };
});

const colourStyles: Partial<Styles<OptionTypeBase, true, GroupTypeBase<OptionTypeBase>>> = {
    control: (styles) => ({ ...styles, backgroundColor: "#374151", borderColor: "#374151" }),
    menu: (styles) => ({ ...styles, backgroundColor: "#374151" }),
    option: (styles, { isDisabled }) => {
        return {
            ...styles,
            backgroundColor: "#374151",
            color: "#fff",
            cursor: isDisabled ? "not-allowed" : "default",
            ":hover": {
                ...styles[":hover"],
                backgroundColor: "#2b6fdc",
            },
            ":active": {
                ...styles[":active"],
                backgroundColor: "#2b6fdc",
            },
        };
    },
    multiValue: (styles) => ({
        ...styles,
        backgroundColor: "#2b6fdc",
    }),
    multiValueLabel: (styles) => ({
        ...styles,
        color: "#fff",
    }),
    multiValueRemove: (styles) => ({
        ...styles,
        ":hover": {
            ...styles[":hover"],
            backgroundColor: "#235ebe",
            color: "#fff",
        },
        backgroundColor: "#2b6fdc",
        color: "#fff",
    }),
};

export default class ExcludeComponents extends React.Component<{}, ExcluderState> {
    constructor(props) {
        super(props);
        this.onChangeEvent = this.onChangeEvent.bind(this);
        this.state = {
            excludedGroups: [],
            loaded: false,
        };
    }

    componentDidMount() {
        const excluded = JSON.parse(
            getLocalStorageData(localStorage, "vtapi.excluded", JSON.stringify([]))
        ) as string[];
        const remappedState = excluded
            .map((e) => {
                const mapped = GROUPS_NAME_MAP[e];
                if (isNone(mapped)) {
                    return undefined;
                }
                return {
                    value: e,
                    label: mapped,
                };
            })
            .filter((e) => typeof e !== "undefined");
        this.setState({ excludedGroups: remappedState, loaded: true });
    }

    onChangeEvent(data: any[], _a: ActionMeta<any>) {
        const mappedValue = data.map((e) => e.value) as string[];
        this.setState({ excludedGroups: data });
        localStorage.setItem("vtapi.excluded", JSON.stringify(mappedValue));
    }

    render() {
        if (!this.state.loaded) {
            return null;
        }
        return (
            <>
                <div className="flex flex-col mt-4 gap-2 ml-2">
                    <div className="flex text-lg font-semibold">Exclude Groups</div>
                    <div className="flex text-sm text-gray-300 -mt-1">
                        This will not affect the Channel and Video Page
                    </div>
                    <Select
                        inputId="excluder-input-box"
                        defaultValue={this.state.excludedGroups}
                        noOptionsMessage={() => "No more options"}
                        options={OPTIONS}
                        styles={colourStyles}
                        onChange={this.onChangeEvent}
                        className="basic-multi-select w-full md:w-1/2 lg:w-1/3"
                        isSearchable={false}
                        isMulti
                    />
                </div>
            </>
        );
    }
}
