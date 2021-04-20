import React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";

class GroupModal extends React.Component {
    constructor(props) {
        super(props);
        this.handleHide = this.handleHide.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.toggler = this.toggler.bind(this);
        this.state = {
            show: false,
        }
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
        this.setState({show: true});
    }

    handleHide() {
        this.setState({show: false});
    }
    
    toggler() {
        this.setState({show: !this.state.show});
    }

    render() {
        let { children, className } = this.props;
        className = className || "";

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
        )
    }
}

export default GroupModal;
