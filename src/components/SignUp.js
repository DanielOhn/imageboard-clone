import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";

import { withFirebase } from "../firebase";
import * as ROUTES from "../constants/routes";
import * as ROLES from "../constants/roles";

import Page from "./Page";

const SignUpPage = () => (
  <Page>
    <hr />
    <h1 className="title">Sign Up</h1>
    <SignUpForm />
  </Page>
);

const INITIAL_STATE = {
  username: "",
  email: "",
  passwordOne: "",
  passwordTwo: "",
  isAdmin: false,
  error: null
};

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { username, email, passwordOne, isAdmin } = this.state;

    const roles = [];

    if (isAdmin) {
      roles.push(ROLES.ADMIN);
    }

    this.props.firebase
      .doCreateUser(email, passwordOne)
      .then(authUser => {
        this.props.firebase.user(authUser.user.uid).set({
          username,
          email,
          roles
        });
      })
      // .then(() => {
      //   return this.props.firebase.doSendEmailVerify();
      // })
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

  onChangeCheckbox = event => {
    this.setState({ [event.target.name]: event.target.checked });
  };

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error,
      isAdmin
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === "" ||
      email === "" ||
      username === "";

    return (
      <form onSubmit={this.onSubmit}>
        <div className="field">
          <div className="control">
            <input
              name="username"
              value={username}
              onChange={this.onChange}
              type="text"
              className="input"
              placeholder="Name"
            />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <input
              name="email"
              value={email}
              onChange={this.onChange}
              type="text"
              className="input"
              placeholder="Email"
            />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <input
              name="passwordOne"
              value={passwordOne}
              onChange={this.onChange}
              type="password"
              className="input"
              placeholder="Password"
            />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <input
              name="passwordTwo"
              value={passwordTwo}
              onChange={this.onChange}
              type="password"
              className="input"
              placeholder="Confirm Password"
            />
          </div>
        </div>

        <button className="button" disabled={isInvalid} type="submit">
          Sign Up
        </button>
        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const SignUpForm = compose(
  withRouter,
  withFirebase
)(SignUpFormBase);

export default SignUpPage;

export { SignUpForm, SignUpLink };
