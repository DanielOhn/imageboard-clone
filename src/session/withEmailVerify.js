import React from "react";

import AuthUserContext from "./context";
import { withFirebase } from "../firebase";

const withEmailVerify = Component => {
  class WithEmailVerify extends React.Component {
    constructor(props) {
      super(props);

      this.state = { isSent: false };
    }

    onSendEmailVerification = () => {
      this.props.firebase
        .doSendEmailVerify()
        .then(() => this.setState({ isSent: true }));
    };

    render() {
      return (
        <AuthUserContext.Consumer>
          {authUser =>
            needsEmailVerification(authUser) ? (
              <div>
                {this.state.isSent ? (
                  <p>
                    Verify your E-Mail: Check your E-Mail (Spam Folders
                    included) for confirmation email or send another
                    confirmation email.
                  </p>
                ) : (
                  <p>
                    Verify your E-Mail: Check your E-Mail (Spam Folders
                    included) for confirmation email or send another
                    confirmation email.
                  </p>
                )}

                <button
                  type="button"
                  onClick={this.onSendEmailVerification}
                  disabled={this.state.isSent}
                >
                  Send Confirmation Email
                </button>
              </div>
            ) : (
              <Component {...this.props} />
            )
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return withFirebase(WithEmailVerify);
};

const needsEmailVerification = authUser => authUser && !authUser.emailVerified;

// If you wanna include social site logins
// && authUser.providerData.map(provider => provider.providerId).includes('password');

export default withEmailVerify;
