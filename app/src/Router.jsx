import { createBrowserRouter, RouterProvider, useParams } from "react-router-dom"
import App from "./App"
import ErrorPage from "./components/ErrorPage"
import Threads from "./components/Threads"
import Profile from "./components/Profile"
import Thread from "./components/Thread"
import Friends from "./components/Friends"
import SignUp from "./components/SignUp"
import NewThread from "./components/NewThread"
import Notifications from "./components/Notifications"
import UpdateProfile from "./components/UpdateProfile"
import FindFriends from "./components/FindFriends"
import Posts from "./components/Posts"
import Post from "./components/Post"
import NewPost from "./components/NewPost"

const Router = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      errorElement: <ErrorPage />,
    },
    {
      path: "users/sign-up",
      element: <SignUp />,
    },
    {
      path: "users/posts",
      element: <Posts />,
    },
    {
      path: "users/new-post",
      element: <NewPost />,
    },
    {
      path: "users/posts/:postid",
      element: <PostWrapper />,
    },
    {
      path: "users/friends",
      element: <Friends />,
    },
    {
      path: "users/find-friends",
      element: <FindFriends />,
    },
    {
      path: "users/new-thread",
      element: <NewThread />,
    },
    {
      path: "users/profiles/:profileid",
      element: <ProfileWrapper />,
    },
    {
      path: "users/user/update-profile",
      element: <UpdateProfile />,
    },
    {
      path: "users/threads",
      element: <Threads />,
    },
    {
      path: "users/threads/:threadid",
      element: <ThreadWrapper />,
    },
    {
      path: "users/notifications",
      element: <Notifications />,
    },
  ])

  return <RouterProvider router={router} />
}

const ProfileWrapper = () => {
  const { profileid } = useParams();
  return <Profile profileId={profileid} />;
};

const ThreadWrapper = () => {
  const { threadid } = useParams();
  return <Thread threadId={threadid} />;
};

const PostWrapper = () => {
  const { postid } = useParams();
  return <Post postId={postid} />;
};

export default Router
