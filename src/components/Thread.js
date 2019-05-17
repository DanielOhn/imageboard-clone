import React, { Component } from "react";
import { Link } from "react-router-dom";

import { withFirebase } from "../firebase";

import Page from "./Page";
import { auth } from "firebase";

const ThreadPage = ({ threads, board }) => {
  return (
    <div className="section">{<Threads threads={threads} board={board} />}</div>
  );
};

class ThreadsBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      boardId: this.props.boardId,
      loading: false,
      threads: undefined,
      title: "",
      text: "",
      img: "",
      threadId: 0,
      test: ""
    };
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onCreateThread = event => {
    const { title, text, img } = this.state;
    const { board } = this.props;

    const thread = {
      title: title,
      text: text,
      img: img,
      userId: null,
      createdAt: this.props.firebase.serverValue.TIMESTAMP,
      posts: [{}]
    };

    const ref = this.props.firebase.db.ref(
      "boards/" + board.title + "/threads"
    );

    ref.push(thread);

    this.setState({
      title: "",
      text: "",
      img: ""
    });

    event.preventDefault();
  };

  onRemoveThread = threadId => {
    const { board } = this.props;
    delete board.threads[threadId];
    this.props.firebase.board(board.title).update(board);
  };

  componentDidMount() {
    this.onListenForThreads();
  }

  onListenForThreads = () => {
    this.setState({ loading: true });

    const { board } = this.props;

    this.props.firebase.db
      .ref("boards/" + board.title + "/threads")
      .on("value", snapshot => {
        const threadObject = snapshot.val();

        console.log(threadObject);
        if (threadObject) {
          const threadList = Object.keys(threadObject).map(key => ({
            ...threadObject[key],
            uid: key
          }));

          this.setState({ threads: threadList, loading: false });
        } else {
          this.setState({ threads: undefined, loading: false });
        }
      });
  };

  componentWillUnmount() {
    this.props.firebase.boards().off();
  }

  render() {
    const { threads, loading, title, text, img } = this.state;
    const { board } = this.props;

    const isInvalid = title === "" || text === "" || img === "";

    return (
      <div>
        <div>
          <h3 className="subtitle">Create Thread</h3>
          <form onSubmit={event => this.onCreateThread(event)}>
            <div className="field">
              <label className="label">Title</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name="title"
                  value={title}
                  onChange={this.onChange}
                  placeholder="Title of the Thread"
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Text</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name="text"
                  value={text}
                  onChange={this.onChange}
                  placeholder="Insert text of the thread here."
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Image</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name="img"
                  value={img}
                  onChange={this.onChange}
                  placeholder="Upload IMG here."
                />
              </div>
            </div>
            <div className="control">
              <button
                className="button is-primary"
                type="submit"
                disabled={isInvalid}
              >
                Create Thread
              </button>
            </div>
          </form>
          <hr />
        </div>

        {loading && <span>loading...</span>}

        {!threads && <p>You don't have any threads at the moment... :c</p>}

        {threads && (
          <ThreadList
            board={board}
            threads={threads.map(thread => ({
              ...thread
            }))}
            onRemoveThread={this.onRemoveThread}
          />
        )}
      </div>
    );
  }
}

const ThreadList = ({ board, threads, onRemoveThread }) => (
  <div>
    <ul>
      {threads.map(thread => (
        <ThreadItem
          board={board}
          key={thread.uid}
          thread={thread}
          onRemoveThread={onRemoveThread}
        />
      ))}
    </ul>
  </div>
);

class ThreadItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      toggle: false,
      imgClass: "image is-128x128"
    };
  }

  handleClick = () => {
    const { toggle } = this.state;

    if (toggle) {
      this.setState({ toggle: !toggle, imgClass: "image is-128x128" });
    } else {
      this.setState({ toggle: !toggle, imgClass: "image" });
    }

    console.log(toggle);
  };

  render() {
    const { thread, board, onRemoveThread } = this.props;
    const { imgClass } = this.state;

    return (
      <div className="box">
        <article className="media">
          <figure className="media-left">
            <figure className={imgClass}>
              <img
                onClick={() => this.handleClick()}
                src={thread.img}
                alt="a dog"
              />
            </figure>
          </figure>
          <div className="media-content">
            <div className="content">
              <p>
                <strong>
                  <Link
                    to={{
                      pathname: `${board.title}/${thread.uid}`
                    }}
                  >
                    {thread.title}
                  </Link>
                </strong>
                <br />
                {thread.text}
              </p>
            </div>
          </div>
        </article>
      </div>
    );
  }
}

class ThreadBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      board: undefined,
      thread: undefined,
      posts: undefined,
      ...props.location.state,
      text: "",
      img: "",
      imgClass: "image is-128x128",
      toggle: false
    };
  }

  onListenForPosts() {
    const { board_id, thread_id } = this.props.match.params;

    this.props.firebase.db
      .ref("boards/" + board_id + "/threads/" + thread_id + "/posts")
      .on("value", snapshot => {
        const postObject = snapshot.val();

        console.log(postObject);

        if (postObject) {
          const postList = Object.keys(postObject).map(key => ({
            ...postObject[key],
            uid: key
          }));

          console.log(postList);
          this.setState({
            posts: postList,
            loading: false
          });
        } else {
          this.setState({ posts: undefined, loading: false });
        }
      });
  }

  componentDidMount() {
    const { board_id, thread_id } = this.props.match.params;

    this.props.firebase.board(board_id).once("value", snapshot => {
      this.setState({
        board: snapshot.val(),
        thread: snapshot.val().threads[thread_id]
      });

      // console.log(this.state.board);
      // console.log(this.state.thread);
    });

    this.onListenForPosts();
  }

  componentWillUnmount() {
    this.props.firebase.boards().off();
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onCreatePost = event => {
    const { text, img, board } = this.state;
    const { thread_id } = this.props.match.params;

    const newPost = {
      text: text,
      img: img,
      createdAt: this.props.firebase.serverValue.TIMESTAMP
    };

    const ref = this.props.firebase.db.ref(
      "boards/" + board.title + "/threads/" + thread_id + "/posts"
    );

    ref.push(newPost);

    this.setState = {
      text: "",
      img: ""
    };

    event.preventDefault();
  };

  handleClick = () => {
    const { toggle } = this.state;

    if (toggle) {
      this.setState({ toggle: !toggle, imgClass: "image is-128x128" });
    } else {
      this.setState({ toggle: !toggle, imgClass: "image" });
    }

    console.log(toggle);
  };

  render() {
    const { board, thread, loading, img, text, posts, imgClass } = this.state;

    // console.log(posts);
    return (
      <Page>
        {loading && <div>Loading . . .</div>}

        {thread && (
          <div>
            <h2>{board.title}</h2>
            <p>
              {board.name} - {board.desc}
            </p>
            <hr />
            <h3 className="subtitle">Create Post</h3>
            <form onSubmit={event => this.onCreatePost(event)}>
              <div className="field">
                <label className="label">Text</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    name="text"
                    value={text}
                    onChange={this.onChange}
                    placeholder="Enter text here..."
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Image</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    name="img"
                    value={img}
                    onChange={this.onChange}
                    placeholder="Upload IMG here."
                  />
                </div>
              </div>
              <div className="control">
                <button className="button is-primary" type="submit">
                  Create Post
                </button>
              </div>
            </form>
            <hr />
            <div className="box">
              <article className="media">
                <figure className="media-left">
                  <figure className={imgClass}>
                    <img
                      src={thread.img}
                      onClick={() => this.handleClick()}
                      alt="a cat"
                    />
                  </figure>
                </figure>
                <div className="media-content">
                  <div className="content">
                    <p>
                      <strong>{thread.title}</strong>
                      <br />
                      {thread.text}
                    </p>
                  </div>
                </div>
              </article>
            </div>
            {posts && (
              <PostList
                posts={posts.map(post => ({
                  ...post
                }))}
                board={board}
              />
            )}
          </div>
        )}
      </Page>
    );
  }
}

const PostList = ({ posts, board }) => (
  <div>
    <ul>
      {posts.map(post => (
        <PostItem post={post} key={post.uid} board={board} />
      ))}
    </ul>
  </div>
);

class PostItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imgClass: "ui image is-128x128",
      toggle: false
    };
  }

  handleClick = () => {
    const { toggle } = this.state;

    var image_class = "";

    if (toggle) {
      image_class = "ui image is-128x128";
    } else {
      image_class = "ui image";
    }

    this.setState({ toggle: !toggle, imgClass: image_class });
  };

  render() {
    const { post } = this.props;
    const { imgClass } = this.state;

    return (
      <div className="column is-offset-1">
        <hr />
        <div className="ui divided items">
          {post.img && (
            <a className={imgClass}>
              <img
                onClick={() => this.handleClick()}
                src={post.img}
                alt="a moose"
              />
            </a>
          )}
          <div className="content">
            <div className="description">
              <p>{post.text}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const Threads = withFirebase(ThreadsBase);
export const ThreadDetails = withFirebase(ThreadBase);

export default ThreadPage;
