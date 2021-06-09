import React from "react";
import {
    Modal as ModalMain,
    ModalBody as ModalMainBody,
    ModalBodyProps as ModalMainBodyProps,
    ModalFooter as ModalMainFooter,
    ModalFooterProps as ModalMainFooterProps,
    ModalHeader as ModalMainHead,
    ModalHeaderProps as ModalMainHeadProps,
    ModalProps as ModalMainProps,
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

interface ModalProps extends ModalMainProps {
    onMounted?: (callbacks: CallbackModal) => void;
}

function ModalHead(props: ModalMainHeadProps) {
    const { className, children, ...rest } = props;
    return (
        <ModalMainHead
            {...rest}
            className={`font-bold border-gray-500 ${typeof className === "string" ? className : ""}`}
        >
            {children}
        </ModalMainHead>
    );
}

function ModalBody(props: ModalMainBodyProps) {
    const { className, children, ...rest } = props;
    return (
        <ModalMainBody
            {...rest}
            className={`flex flex-col grid-cols-1 gap-2 ${typeof className === "string" ? className : ""}`}
        >
            {children}
        </ModalMainBody>
    );
}

function ModalFooter(props: ModalMainFooterProps) {
    const { className, children, ...rest } = props;
    return (
        <ModalMainFooter {...rest} className={className || ""}>
            {children}
        </ModalMainFooter>
    );
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
        // Extract out the onMounted
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { onMounted, contentClassName, ...props } = this.props;
        return (
            <ModalMain
                {...props}
                contentClassName={`bg-gray-700 ${contentClassName ?? ""}`}
                isOpen={this.state.show}
                toggle={this.toggleModal}
                scrollable
                centered
            >
                {this.props.children}
            </ModalMain>
        );
    }
}

export default Modal;
