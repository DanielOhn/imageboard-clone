import React from "react";
import { Link } from "react-router-dom";

import SignOutButton from "./SignOut";

import * as ROUTES from "../constants/routes";
import * as ROLES from "../constants/roles";

import { AuthUserContext } from "../session";

const NavBar = () => (
  <AuthUserContext.Consumer>
    {authUser => (authUser ? <NavAuth authUser={authUser} /> : <Nav />)}
  </AuthUserContext.Consumer>
);

const NavAuth = ({ authUser }) => (
  <nav className="breadcrumb is-centered" aria-label="breadcrumbs">
    <ul>
      <li>
        <Link to={ROUTES.HOME}>Home</Link>
      </li>
      <li>
        <Link to={ROUTES.ACCOUNT}>Account</Link>
      </li>
      {authUser.roles.includes(ROLES.ADMIN) && (
        <li>
          <Link to={ROUTES.ADMIN}>Admin</Link>
        </li>
      )}
      <li>
        <SignOutButton />
      </li>
    </ul>
    <hr />
  </nav>
);

const Nav = () => (
  <nav className="breadcrumb is-centered" aria-label="breadcrumbs">
    <ul>
      <li>
        <Link to={ROUTES.HOME}>Home</Link>
      </li>
      {/* <li>
        <Link to={ROUTES.LOG_IN}>Log In</Link>
      </li> */}
    </ul>
  </nav>
);

export default NavBar;
