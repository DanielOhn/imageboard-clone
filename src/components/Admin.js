import React, { Component } from "react";
import { compose } from "recompose";
import { Link } from "react-router-dom";

import { withFirebase } from "../firebase";
import { withAuthorization, withEmailVerify } from "../session";
import Page from "./Page";

import * as ROLES from "../constants/roles";
import * as ROUTES from "../constants/routes";

const AdminPage = () => (
  <Page>
    <div className="container is-fluid">
    <h1 className="title">Admin</h1>
    <h2 className="subtitle">This page is for cool, sexy server admins only.</h2>

    <UserList />
    </div>
  </Page>
);

class UserListBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      users: []
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.users().on("value", snapshot => {
      const usersObject = snapshot.val();

      const usersList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key
      }));

      this.setState({
        users: usersList,
        loading: false
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  render() {
    const { users, loading } = this.state;

    return (
      <>
        <h2 className="subtitle">Users Table</h2>
        {loading && <div>Loading...</div>}
        <div className="table is-striped">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody> 
            {users.map(user => (
              <tr key={user.uid}>
                <th>{user.uid}</th>  
                <th>
                  <Link
                    to={{
                      pathname: `${ROUTES.ADMIN}/${user.uid}`,
                      state: { user }
                    }}
                  >
                    {user.username}
                  </Link>
                </th>
                <th>{user.email}</th>
            </tr>
            ))}
          </tbody>
        </div>
      </>
    );
  }
}

class UserItemBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      user: null,
      ...props.location.state
    };
  }

  componentDidMount() {
    if (this.state.user) {
      return;
    }

    this.setState({ loading: true });

    this.props.firebase
      .user(this.props.match.params.id)
      .on("value", snapshot => {
        this.setState({
          user: snapshot.val(),
          loading: false
        });
      });
  }

  componentWillUnmount() {
    this.props.firebase.user(this.props.match.params.id).off();
  }

  onSendPasswordResetEmail = () => {
    this.props.firebase.doPasswordReset(this.state.user.email);
  };

  render() {
    const { user, loading } = this.state;

    return (
      <Page>
        <h2>User ({this.props.match.params.id})</h2>
        {loading && <div>Loading ...</div>}

        {user && (
          <div>
            <span>
              <strong>ID:</strong> {user.uid}
            </span>
            <span>
              <strong>E-Mail:</strong> {user.email}
            </span>
            <span>
              <strong>Username:</strong> {user.username}
            </span>
            <span>
              <button type="button" onClick={this.onSendPasswordResetEmail}>
                Send Password Reset
              </button>
            </span>
          </div>
        )}
      </Page>
    );
  }
}

export const UserList = withFirebase(UserListBase);
export const UserItem = withFirebase(UserItemBase);

const condition = authUser => authUser && authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withEmailVerify,
  withAuthorization(condition)
)(AdminPage);
