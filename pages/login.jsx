import React from "react";
import Router from 'next/router'
import Link from 'next/link'
import { useUser } from '../lib/hooks'
import { v4 as uuidv4 } from 'uuid'
import Buttons from '../components/buttons';

const fetcher = (url) => fetch(url).then((r) => r.json())

class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.setErrorMessage = this.setErrorMessage.bind(this);
        this.state = {
            errorMsg: "",
        }
    }

    componentDidMount() {
        fetcher("/api/user").then((res) => {
            if (res?.user) {
                Router.push("/admin");
            }
        }).catch((err) => {})
    }

    setErrorMessage(message) {
        this.setState({errorMsg: message});
    }

    async onSubmit(e) {
        e.preventDefault();
        const userStr = uuidv4();

        const body = {
            username: userStr,
            password: e.currentTarget.password.value,
        };
        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
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
            <main className="flex flex-wrap text-center text-white justify-center items-center min-h-screen w-screen overflow-hidden bg-gray-800">
                <div className="fixed w-full self-center place-self-center items-center place-items-center justify-items-center">
                    <form onSubmit={this.onSubmit} className="mx-auto">
                        <label className="inline-flex flex-col justify-center">
                            <span className="text-gray-100 text-lg mb-2 tracking-wide uppercase">Password</span>
                            <input type="password" name="password" placeholder="********" required className="form-input bg-gray-700 border border-gray-700 focus:outline-none focus:border-blue-500 rounded-lg" />
                        </label>
                        {this.state.errorMsg && 
                            (
                                <>
                                <div className="flex justify-center mt-2">
                                    <span className="font-semibold text-red-400 text-sm">Error: {this.state.errorMsg}</span>
                                </div>
                                </>
                            )
                        }
                        <div className="flex flex-row gap-2 mt-4 justify-center">
                            <Buttons type="submit" type="blue">Login</Buttons>
                        </div>
                    </form>
                </div>
            </main>
        )
    }
}

export default LoginPage;
