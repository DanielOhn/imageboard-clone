import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import HomePage, { BoardDetails } from "./Home";
import { ThreadDetails } from "./Thread";
import SignUpPage from "./SignUp";
import LoginPage from "./Login";
import PasswordChangePage from "./PasswordChange";
import PasswordForgetPage from "./PasswordForget";
import AccountPage from "./Account";
import AdminPage, { UserItem, UserList } from "./Admin";

import * as ROUTES from "../constants/routes";
import { withAuthentication } from "../session";

const App = () => (
  <section className="section">
    <Router>
      <Switch>
        <Route exact path={ROUTES.HOME} component={HomePage} />
        <Route exact path={ROUTES.ACCOUNT} component={AccountPage} />
        <Route exact path={ROUTES.ADMIN} component={AdminPage} />

        {/* Signing In/Up/Out and Passwords */}
        {/* <Route exact path={ROUTES.SIGN_UP} component={SignUpPage} /> */}
        {/* <Route exact path={ROUTES.LOG_IN} component={LoginPage} /> */}
        <Route
          exact
          path={ROUTES.PASSWORD_FORGET}
          component={PasswordForgetPage}
        />
        <Route
          exact
          path={ROUTES.PASSWORD_CHANGE}
          component={PasswordChangePage}
        />

        <Route exact path={ROUTES.ADMIN_DETAILS} component={UserItem} />
        <Route exact path={ROUTES.ADMIN} component={UserList} />

        {/* Board and Threads */}
        <Route exact path={ROUTES.BOARD_DETAILS} component={BoardDetails} />
        <Route exact path={ROUTES.THREAD_DETAILS} component={ThreadDetails} />
      </Switch>
    </Router>
  </section>
);

export default withAuthentication(App);
