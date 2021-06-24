import React from "react";

import Buttons from "./Buttons";
import Markdownify from "./Markdown";
import Modal, { CallbackModal } from "./Modal";

import { isNone, Nullable } from "../lib/utils";
import { PlatformType } from "../lib/vt";
import fetcher from "../lib/fetcher";

function isNumber(data: any): data is number {
    if (typeof data === "number") {
        return true;
    }
    const intData = parseInt(data);
    if (isNaN(intData)) {
        return false;
    }
    return true;
}

function simpleWalk<T = any>(data: any, notations: string): Nullable<T> {
    const splitNots = notations.split(".");
    for (let i = 0; i < splitNots.length; i++) {
        if (isNone(data)) {
            return data;
        }
        const nt = splitNots[i];
        if (isNumber(nt)) {
            data = data[parseInt(nt)];
        } else {
            data = data[nt];
        }
    }
    return data;
}

export interface NoteData {
    id: string;
    platform: PlatformType | "unknown";
    note?: Nullable<string>;
}

export interface EditorPropsCallbacks {
    showModal: (data: NoteData) => void;
}

interface NoteEditorProps {
    onMounted: (callback: EditorPropsCallbacks) => void;
    onModalClose?: (data: NoteData) => void;
}

type NoteEditorState = {
    [Prop in keyof NoteData as `current${Capitalize<string & Prop>}`]: NoteData[Prop];
};

type NoteEditorStateReal = NoteEditorState & { oldNote?: Nullable<string>; submit: boolean };

export default class NoteEditorModal extends React.Component<NoteEditorProps, NoteEditorStateReal> {
    modalCb?: CallbackModal;

    constructor(props: React.PropsWithChildren<NoteEditorProps>) {
        super(props);
        this.doModal = this.doModal.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleSubmission = this.handleSubmission.bind(this);
        this.state = {
            currentId: "",
            currentPlatform: "unknown",
            currentNote: "",
            oldNote: "",
            submit: false,
        };
    }

    componentDidMount() {
        if (typeof this.props.onMounted === "function") {
            const outerThis = this;
            this.props.onMounted({
                showModal: (data: NoteData) => outerThis.handleShow(data),
            });
        }
    }

    doModal(target: "show" | "hide" | "toggle" = "show") {
        if (this.modalCb) {
            switch (target) {
                case "show":
                    this.modalCb.showModal();
                    break;
                case "hide":
                    this.modalCb.hideModal();
                    break;
                case "toggle":
                    this.modalCb.toggleModal();
                    break;
                default:
                    break;
            }
        }
    }

    handleShow(note: NoteData) {
        this.setState(
            {
                currentId: note.id,
                currentPlatform: note.platform,
                currentNote: note.note,
                oldNote: note.note,
            },
            () => {
                this.doModal();
            }
        );
    }

    async handleSubmission() {
        const { currentId, currentPlatform, oldNote } = this.state;
        let { currentNote } = this.state;
        if (oldNote === currentNote) {
            this.doModal("hide");
            return;
        }
        this.setState({ submit: true });
        try {
            const jsonBody = {
                id: this.state.currentId,
                platform: this.state.currentPlatform,
                note: this.state.currentNote,
            };
            const res = await fetcher("/api/note", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(jsonBody),
            });
            const walkData = simpleWalk(res, "data.VTuberSetNote.id");
            if (typeof walkData !== "string") {
                console.error("An error occured!, ignoring...");
                currentNote = oldNote;
            }
        } catch (e) {
            console.error("An error occured!, ignoring...");
            currentNote = oldNote;
        }
        if (typeof this.props.onModalClose === "function") {
            this.props.onModalClose({
                id: currentId,
                platform: currentPlatform,
                note: currentNote,
            });
        }
        this.setState({ submit: false });
        this.doModal("hide");
    }

    render() {
        return (
            <Modal
                className="modal-xl !h-screen"
                contentClassName="!h-screen"
                onMounted={(cb) => (this.modalCb = cb)}
            >
                <Modal.Head toggle={() => this.doModal("toggle")}>Editor</Modal.Head>
                <Modal.Body className="flex flex-col lg:flex-row gap-2 justify-center">
                    <div className="mt-2 flex flex-col lg:flex-row gap-2 justify-start lg:justify-center h-full">
                        <div className="flex flex-col w-full lg:w-1/2">
                            <p className="font-bold">Input</p>
                            <hr className="mt-2" />
                            <textarea
                                className="form-textarea mt-2 w-full h-[30vh] lg:h-full bg-gray-800 rounded-lg border-gray-700 hover:border-gray-400 transition duration-200"
                                value={this.state.currentNote}
                                onChange={(ev) => this.setState({ currentNote: ev.target.value })}
                            />
                        </div>
                        <div className="flex flex-col w-full lg:w-1/2">
                            <p className="font-bold ml-2">Preview</p>
                            <hr className="mx-1 my-2" />
                            <Markdownify>{this.state.currentNote}</Markdownify>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-gray-500 justify-start">
                    <Buttons btnType="success" onClick={this.handleSubmission} disabled={this.state.submit}>
                        Submit
                    </Buttons>
                    <Buttons btnType="warning" onClick={() => this.doModal("hide")}>
                        Cancel
                    </Buttons>
                </Modal.Footer>
            </Modal>
        );
    }
}
