import React from "react";
import { compose } from "recompose";

import Page from "./Page";

import {
  AuthUserContext,
  withAuthorization,
  withEmailVerify
} from "../session";

import { PasswordForgetForm } from "./PasswordForget";
import PasswordChangeForm from "./PasswordChange";

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <Page>
        <h1>Account: {authUser.email}</h1>
        <PasswordForgetForm />
        <PasswordChangeForm />
      </Page>
    )}
  </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser;

export default compose(
  withEmailVerify,
  withAuthorization(condition)
)(AccountPage);
