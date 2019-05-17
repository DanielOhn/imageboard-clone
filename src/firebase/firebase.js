import app from "firebase/app";
import "firebase/auth";
import "firebase/database";

const config = {
  apiKey: "AIzaSyA1r19xvhCKbUfl9pk_AvYHxhfPBrnkqgw",
  authDomain: "imageboard-clone.firebaseapp.com",
  databaseURL: "https://imageboard-clone.firebaseio.com",
  projectId: "imageboard-clone",
  storageBucket: "imageboard-clone.appspot.com",
  messagingSenderId: "743596630242"
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    this.auth = app.auth();
    this.db = app.database();

    //Helper
    this.serverValue = app.database.ServerValue;
  }

  // Auth API
  doCreateUser = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignIn = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password => this.auth.currentUser.updatePassword(password);

  doSendEmailVerify = () =>
    this.auth.currentUser.sendEmailVerification({
      url: "http://localhost:3000"
    });

  // Merg Auth and DB User API
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
          .once("value")
          .then(snapshot => {
            const dbUser = snapshot.val();

            if (!dbUser.roles) {
              dbUser.roles = [];
            }

            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              ...dbUser
            };

            next(authUser);
          });
      } else {
        fallback();
      }
    });

  // User API
  user = uid => this.db.ref(`users/${uid}`);

  users = () => this.db.ref("users");

  // Boards API
  board = uid => {
    return this.db.ref(`boards/${uid}`);
  };

  boards = () => this.db.ref("boards");

  createBoards = title => this.db.ref(`boards/${title}`);
}

/*
- CREATE FUNCTION TO GET THREAD ARRAY OBJECT BASED OFF BOARD ID HERE
- CALL THAT IN THE THREADS.JS TO GET AN UPDATED VERSION OF THE THREAD ARRAY
- MAP THAT FUNCTION TO GET THE THREAD ARRAY
- THEN EXTRACT THE OBJECT WITHIN THE ARRAY TO GET THE THREAD INFORMATION 
*/
export default Firebase;
