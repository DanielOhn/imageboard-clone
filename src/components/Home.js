import React, { Component } from "react";
import { Link } from "react-router-dom";
import { compose } from "recompose";

import {
  AuthUserContext,
  withAuthorization,
  withEmailVerify
} from "../session";

import Page from "./Page";
import { withFirebase } from "../firebase";

// import { getBoard } from "../firebase/firebase";
import ThreadPage from "./Thread";

// ****************
// Home Page
class HomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: null
    };
  }

  componentDidMount() {
    this.props.firebase.users().on("value", snapshot => {
      this.setState({
        users: snapshot.val()
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  render() {
    return (
      <Page>
        <div className="container is-fluid">
          <h1 className="title">Home Page</h1>
          <h2 className="subtitle">
            Basic image board that was created using reactjs and bulma.
          </h2>
          <Boards users={this.state.users} />
        </div>
      </Page>
    );
  }
}

// **************
// Board Base
class BoardsBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: "",
      name: "",
      desc: "",
      loading: false,
      boards: []
    };
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onCreateBoard = (event, authUser) => {
    this.props.firebase.createBoards(this.state.title).set({
      title: this.state.title,
      name: this.state.name,
      desc: this.state.desc,
      userId: authUser.uid,
      threads: [
        {
          title: "Welcome!",
          text: "Congratulations on your first board.",
          img:
            "https://static.boredpanda.com/blog/wp-content/uploads/2015/09/Happy-Cats__880.jpg",
          userId: authUser.uid,
          createdAt: this.props.firebase.serverValue.TIMESTAMP,
          posts: [
            {
              img: null,
              text: "first!",
              createdAt: this.props.firebase.serverValue.TIMESTAMP
            }
          ]
        }
      ],
      createdAt: this.props.firebase.serverValue.TIMESTAMP
    });

    this.setState({
      title: "",
      name: "",
      desc: ""
    });

    event.preventDefault();
  };

  onRemoveBoard = uid => {
    this.props.firebase.board(uid).remove();
  };

  onEditBoard = (board, name, desc) => {
    this.props.firebase.board(board.uid).set({
      ...board,
      name,
      desc,
      editedAt: this.props.firebase.serverValue.TIMESTAMP
    });
  };

  // ADD - IF USER IS THE OWNER SHOW SETTINGS/EDIT OPTIONS
  // onBoardOwner = (authUser, board) => {
  //   return this.props.firebase.board(board.userId) === authUser.uid;
  // };

  componentDidMount() {
    this.onListenForBoards();
  }

  onListenForBoards = () => {
    this.setState({ loading: true });

    this.props.firebase
      .boards()
      .orderByChild("createdAt")
      .on("value", snapshot => {
        const boardObject = snapshot.val();

        if (boardObject) {
          const boardList = Object.keys(boardObject).map(key => ({
            ...boardObject[key],
            uid: key
          }));

          this.setState({ boards: boardList, loading: false });
        } else {
          this.setState({ boards: undefined, loading: false });
        }
      });
  };

  componentWillUnmount() {
    this.props.firebase.boards().off();
  }

  render() {
    const { users } = this.props;
    const { boards, title, name, desc, loading } = this.state;

    return (
      <div>
        <AuthUserContext.Consumer>
          {authUser =>
            authUser ? (
              <div>
                <h3 className="subtitle">Create board</h3>
                <form onSubmit={event => this.onCreateBoard(event, authUser)}>
                  <div className="field">
                    <label className="label">Title</label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        name="title"
                        value={title}
                        onChange={this.onChange}
                        placeholder="v"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Name</label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        name="name"
                        value={name}
                        onChange={this.onChange}
                        placeholder="Video Games"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Description</label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        name="desc"
                        value={desc}
                        onChange={this.onChange}
                        placeholder="A board to discuss video games."
                      />
                    </div>
                  </div>

                  <div className="control">
                    <button className="button is-primary" type="submit">
                      Create Board
                    </button>
                  </div>
                </form>

                {loading && <div>Loading ...</div>}

                {!boards && <p>There are no boards here... PepeHands</p>}

                {boards && (
                  <BoardList
                    boards={boards.map(board => ({
                      ...board,
                      user: users
                        ? users[board.userId]
                        : { userId: board.userId }
                    }))}
                    onEditBoard={this.onEditBoard}
                    onRemoveBoard={this.onRemoveBoard}
                  />
                )}
              </div>
            ) : (
              <div>
                {loading && <div>Loading ...</div>}

                {!boards && <p>There are no boards here... PepeHands</p>}

                {boards && (
                  <BoardList
                    boards={boards.map(board => ({
                      ...board,
                      user: users
                        ? users[board.userId]
                        : { userId: board.userId }
                    }))}
                  />
                )}
              </div>
            )
          }
        </AuthUserContext.Consumer>
      </div>
    );
  }
}

const BoardList = ({ boards, onRemoveBoard, onEditBoard }) => (
  <table className="table is-striped">
    <thead>
      <tr>
        <th>
          <abbr title="Title">Title</abbr>
        </th>
        <th>Name</th>
        <th>Desc.</th>
        <th>Creator</th>
      </tr>
    </thead>
    <tbody>
      {boards.map(board => (
        <BoardItem
          key={board.uid}
          board={board}
          onEditBoard={onEditBoard}
          onRemoveBoard={onRemoveBoard}
        />
      ))}
    </tbody>
  </table>
);

//*********
// Board Item
class BoardItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      editName: this.props.board.name,
      editDesc: this.props.board.desc
    };
  }

  onToggleEditMode = () => {
    this.setState(state => ({
      editMode: !state.editMode,
      editName: this.props.board.name,
      editDesc: this.props.board.desc
    }));
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onSaveEdit = () => {
    this.props.onEditBoard(
      this.props.board,
      this.state.editName,
      this.state.editDesc
    );

    this.setState({ editMode: false });
  };

  render() {
    const { board, onRemoveBoard } = this.props;
    // const { editMode, editName, editDesc } = this.state;

    return (
      <>
        {board && (
          <tr>
            <td>
              <Link
                to={{
                  pathname: `${board.title}`
                }}
              >
                {board.title}
              </Link>
            </td>
            <td>{board.name}</td>
            <td>{board.desc}</td>
            <td>{board.user.username || board.user.userId}</td>

            {/* {board.editedAt && <span>(Edited)</span>} */}
          </tr>
        )}
      </>
    );
  }
}

class BoardBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      board: undefined,
      ...props.location.state
    };
  }

  componentDidMount() {
    this.props.firebase
      .board(this.props.match.params.board_id)
      .on("value", snapshot => {
        this.setState({
          board: snapshot.val(),
          loading: false
        });
      });
  }

  componentWillUnmount() {
    this.props.firebase.board(this.props.match.params.board_id).off();
  }

  render() {
    const { board, loading } = this.state;

    return (
      <Page>
        {loading && <div>Loading ...</div>}

        {board && (
          <div>
            <h1>
              {board.title} - {board.name}
            </h1>

            <div>
              <span>{board.desc}</span>

              <ThreadPage threads={board.threads} board={board} />
            </div>
          </div>
        )}
      </Page>
    );
  }
}

const Boards = withFirebase(BoardsBase);
export const BoardDetails = withFirebase(BoardBase);

const condition = authUser => !!authUser;

export default compose(
  withFirebase,
  withEmailVerify
)(HomePage);
