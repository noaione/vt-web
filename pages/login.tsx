import React from "react";
import Router from "next/router";
import Head from "next/head";
import { v4 as uuidv4 } from "uuid";

import Buttons from "../components/Buttons";
import MetadataHead from "../components/MetadataHead";

import withSession, { NextServerSideContextWithSession, SimpleUser } from "../lib/session";

interface LoginPageState {
    errorMsg: string;
    password: string;
}

class LoginPage extends React.Component<{}, LoginPageState> {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.setErrorMessage = this.setErrorMessage.bind(this);
        this.state = {
            errorMsg: "",
            password: "",
        };
    }

    setErrorMessage(message: string) {
        this.setState({ errorMsg: message, password: "" });
    }

    async onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const userStr = uuidv4();

        const body = {
            username: userStr,
            password: e.currentTarget.password.value,
        };
        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (res.status === 200) {
            const userObj = await res.json();
            if (userObj?.user) {
                Router.push("/admin");
            } else {
                this.setErrorMessage("Incorrect password.");
            }
        } else {
            this.setErrorMessage("Incorrect password.");
        }
    }

    render() {
        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <title>Login :: VTuber API</title>
                    <MetadataHead.SEO title="Login" description="Restricted access" urlPath="/login" />
                </Head>
                <main className="flex flex-wrap text-center text-white justify-center items-center min-h-screen w-screen overflow-hidden bg-gray-800">
                    <div className="fixed w-full self-center place-self-center items-center place-items-center justify-items-center">
                        <form onSubmit={this.onSubmit} className="mx-auto">
                            <label className="inline-flex flex-col justify-center">
                                <span className="text-gray-100 text-lg mb-2 tracking-wide uppercase">
                                    Password
                                </span>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="********"
                                    className="form-input bg-gray-700 border border-gray-700 focus:outline-none focus:border-blue-500 rounded-lg"
                                    value={this.state.password}
                                    onChange={(ev) =>
                                        this.setState({ password: ev.target.value, errorMsg: "" })
                                    }
                                    required
                                />
                            </label>
                            {this.state.errorMsg && (
                                <>
                                    <div className="flex justify-center mt-2">
                                        <span className="font-semibold text-red-400 text-sm">
                                            Error: {this.state.errorMsg}
                                        </span>
                                    </div>
                                </>
                            )}
                            <div className="flex flex-row gap-2 mt-4 justify-center">
                                <Buttons type="submit" btnType="primary">
                                    Login
                                </Buttons>
                            </div>
                        </form>
                    </div>
                </main>
            </>
        );
    }
}

export const getServerSideProps = withSession(async function ({ req }: NextServerSideContextWithSession) {
    const user = req.session.get<SimpleUser>("user");
    if (user) {
        return {
            redirect: {
                destination: "/admin",
                permanent: false,
            },
        };
    }

    return { props: {} };
});

export default LoginPage;
