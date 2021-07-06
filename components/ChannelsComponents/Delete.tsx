import React from "react";
import { connect, ConnectedProps } from "react-redux";

import Buttons from "../Buttons";
import Modal, { CallbackModal } from "../Modal";

import { PlatformType } from "../../lib/vt";

const mapDispatch = {
    removeVTuber: (payload: string) => ({ type: "channels/removeChannelById", payload }),
};

const connector = connect(null, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface DeleteButtonProps extends PropsFromRedux {
    id: string;
    name: string;
    platform: PlatformType;
}

interface DeleteButtonState {
    isSubmit: boolean;
}

class DeleteButton extends React.Component<DeleteButtonProps, DeleteButtonState> {
    modalCb?: CallbackModal;

    constructor(props) {
        super(props);
        this.nukeChannelForReal = this.nukeChannelForReal.bind(this);
        this.handleHide = this.handleHide.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.state = {
            isSubmit: false,
        };
    }

    async nukeChannelForReal() {
        // if (this.state.isSubmit) return;
        // this.setState({
        //     isSubmit: true,
        // });
        // const GQLRequest = {
        //     query: MutationQuery,
        //     operationName: "VTuberRemove",
        //     variables: {
        //         id: this.props.id,
        //         platform: this.props.platform,
        //     },
        // };
        // try {
        //     const requested = await fetcher("https://api.ihateani.me/v2/graphql", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //             Accept: "application/json",
        //             Authorization: `password ${process.env.IHAAPI_PASSWORD ?? ""}`,
        //         },
        //         body: JSON.stringify(GQLRequest),
        //     });
        //     const result = walk(requested, "data.VTuberRemove");
        //     if (isNone(result)) {
        //         // fuck and raise
        //     }
        // } catch (e) {
        //     // fuck
        // }
        // this.setState({ isSubmit: false });
    }

    handleHide() {
        if (this.modalCb) {
            this.modalCb.hideModal();
        }
    }

    handleShow() {
        if (this.modalCb && !this.state.isSubmit) {
            this.modalCb.showModal();
        }
    }

    render() {
        return (
            <>
                <Buttons onClick={this.handleShow} btnType="danger" disabled={this.state.isSubmit}>
                    Delete
                </Buttons>
                <Modal onMounted={(cb) => (this.modalCb = cb)}>
                    <Modal.Head>Are you sure?</Modal.Head>
                    <Modal.Body>
                        <div>
                            This will delete this channel <strong>{this.props.name}</strong> from Database
                        </div>
                        <div>This action is irreversible, please make sure!</div>
                    </Modal.Body>
                    <Modal.Footer outerClassName="justify-center">
                        <Buttons onClick={this.nukeChannelForReal} btnType="danger">
                            Delete
                        </Buttons>
                        <Buttons onClick={this.handleHide} btnType="primary">
                            Cancel
                        </Buttons>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

export default connector(DeleteButton);
