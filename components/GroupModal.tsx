import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

export interface CallbackModal {
    showModal: () => void;
    hideModal: () => void;
    toggleModal?: () => void;
}

interface ModalProps {
    className?: string;
    onMounted?: (callbacks: CallbackModal) => void;
}

interface ModalState {
    show: boolean;
}

class GroupModal extends React.Component<ModalProps, ModalState> {
    constructor(props) {
        super(props);
        this.handleHide = this.handleHide.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.toggler = this.toggler.bind(this);
        this.state = {
            show: false,
        };
    }

    componentDidMount() {
        if (this.props.onMounted) {
            const outerThis = this;
            this.props.onMounted({
                showModal: () => outerThis.handleShow(),
                hideModal: () => outerThis.handleHide(),
            });
        }
    }

    handleShow() {
        this.setState({ show: true });
    }

    handleHide() {
        this.setState({ show: false });
    }

    toggler() {
        this.setState({ show: !this.state.show });
    }

    render() {
        const { children } = this.props;

        return (
            <Modal
                isOpen={this.state.show}
                toggle={this.toggler}
                onHide={this.handleHide}
                contentClassName={"bg-gray-700"}
                scrollable
            >
                <ModalHeader className="font-bold border-gray-500" toggle={this.toggler}>
                    Group
                </ModalHeader>
                <ModalBody className="flex flex-col grid-cols-1 gap-2 flex-wrap flex-grow">
                    {children}
                </ModalBody>
            </Modal>
        );
    }
}

export default GroupModal;
