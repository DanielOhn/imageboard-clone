import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";

import { SignUpLink } from "./SignUp";
import { PasswordForgetLink } from "./PasswordForget";
import { withFirebase } from "../firebase";
import * as ROUTES from "../constants/routes";

import Page from "./Page";

const LoginPage = () => (
  <Page>
    <hr />
    <h1 className="title">Login Page</h1>
    <LoginForm />

    <SignUpLink />
    <PasswordForgetLink />
  </Page>
);

const INITIAL_STATE = {
  email: "",
  password: "",
  error: null
};

class LoginFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { email, password } = this.state;

    this.props.firebase
      .doSignIn(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, password, error } = this.state;

    const isInvalid = password === "" || email === "";

    return (
      <form onSubmit={this.onSubmit}>
        <div className="field">
          <div className="control">
            <input
              name="email"
              value={email}
              onChange={this.onChange}
              type="email"
              className="input"
              placeholder="Email"
            />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <input
              name="password"
              value={password}
              onChange={this.onChange}
              className="input"
              type="password"
              placeholder="Password"
            />
          </div>
        </div>

        <button className="button" disabled={isInvalid} type="submit">
          Login
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const LoginForm = compose(
  withRouter,
  withFirebase
)(LoginFormBase);

export { LoginForm };

export default LoginPage;
