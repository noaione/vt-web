import React from "react";
import {
    Modal as ModalMain,
    ModalBody as ModalMainBody,
    ModalFooter as ModalMainFooter,
    ModalHeader as ModalMainHead,
} from "reactstrap";

interface ModalState {
    show: boolean;
    currentFade?: "show" | "hide" | null;
}

export interface CallbackModal {
    showModal: () => void;
    hideModal: () => void;
    toggleModal?: () => void;
}

interface ModalProps {
    onMounted?: (callbacks: CallbackModal) => void;
}

class ModalHead extends React.Component {
    render() {
        return <ModalMainHead className="font-bold border-gray-500">{this.props.children}</ModalMainHead>;
    }
}

class ModalBody extends React.Component {
    render() {
        return (
            <ModalMainBody className="flex flex-col grid-cols-1 gap-2 flex-wrap flex-grow">
                {this.props.children}
            </ModalMainBody>
        );
    }
}

interface FooterExtra {
    outerClassName?: string;
}

class ModalFooter extends React.Component<FooterExtra> {
    constructor(props: FooterExtra) {
        super(props);
    }

    render() {
        const { outerClassName, children } = this.props;
        return <ModalMainFooter className={outerClassName ?? ""}>{children}</ModalMainFooter>;
    }
}

class Modal extends React.Component<ModalProps, ModalState> {
    divRef?: HTMLDivElement;
    static Head = ModalHead;
    static Body = ModalBody;
    static Footer = ModalFooter;

    constructor(props: ModalProps) {
        super(props);
        this.handleHide = this.handleHide.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.state = {
            show: false,
            currentFade: null,
        };
    }

    componentDidMount() {
        if (typeof this.props.onMounted === "function") {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const outerThis = this;
            this.props.onMounted({
                showModal: () => outerThis.handleShow(),
                hideModal: () => outerThis.handleHide(),
                toggleModal: () => outerThis.toggleModal(),
            });
        }
    }

    handleHide() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const outerThis = this;
        this.setState({ currentFade: "hide" });
        // fade animation thingamagic.
        setTimeout(() => outerThis.setState({ show: false, currentFade: null }), 300);
    }

    handleShow() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const outerThis = this;
        this.setState({ show: true, currentFade: "show" });
        setTimeout(() => outerThis.setState({ currentFade: null }), 300);
    }

    toggleModal() {
        if (this.state.show) {
            this.handleHide();
        } else {
            this.handleShow();
        }
    }

    render() {
        return (
            <ModalMain
                isOpen={this.state.show}
                toggle={this.toggleModal}
                contentClassName="bg-gray-700"
                scrollable
                centered
            >
                {this.props.children}
            </ModalMain>
        );
    }
}

export default Modal;
