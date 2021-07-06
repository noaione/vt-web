import React from "react";
import { connect, ConnectedProps } from "react-redux";

import Buttons from "../Buttons";

import fetcher from "../../lib/fetcher";
import { isNone, mapBoolean, walk } from "../../lib/utils";
import { PlatformType } from "../../lib/vt";
import { UpdateDataPerSteps } from "../../lib/slices/channels";

const mapDispatch = {
    updateRetire: (payload: UpdateDataPerSteps) => ({ type: "channels/updateChannelDataById", payload }),
};

const connector = connect(null, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface RetireButtonProps extends PropsFromRedux {
    id: string;
    name: string;
    platform: PlatformType;
    retired: boolean;
}

interface RetireButtonState {
    isSubmit: boolean;
}

class RetireButton extends React.Component<RetireButtonProps, RetireButtonState> {
    constructor(props) {
        super(props);
        this.setRetireData = this.setRetireData.bind(this);
        this.state = {
            isSubmit: false,
        };
    }

    async setRetireData() {
        if (this.state.isSubmit) return;
        this.setState({
            isSubmit: true,
        });

        const GQLRequest = {
            id: this.props.id,
            platform: this.props.platform,
            retire: !this.props.retired,
        };

        try {
            const requested = await fetcher("/api/retire", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(GQLRequest),
            });
            const result = walk(requested, "data.VTuberRetired");
            if (isNone(result)) {
                // fuck and raise
            } else {
                this.props.updateRetire({
                    targetId: GQLRequest.id,
                    targetPlatform: GQLRequest.platform,
                    updatedData: {
                        is_retired: mapBoolean(result.is_retired),
                    },
                });
            }
        } catch (e) {
            // fuck
        }
        this.setState({ isSubmit: false });
    }

    render() {
        const { retired } = this.props;
        return (
            <Buttons onClick={this.setRetireData} btnType="warning" disabled={this.state.isSubmit}>
                {retired ? "Unretire" : "Retire"}
            </Buttons>
        );
    }
}

export default connector(RetireButton);
