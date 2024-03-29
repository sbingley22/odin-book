var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const asyncHandler = require('express-async-handler')
const { body, validationResult } = require('express-validator');

const User = require('../models/user');
const Profile = require('../models/profile');
const Thread = require('../models/thread');
const Post = require('../models/post');

// Token authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) {
    console.log("No Token")
    next()
    return
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

router.get('/', authenticateToken, async function(req, res, next) {
  if (req.user != null) {
    try {
      const user = await User.findOne({ username: req.user.username }).exec()
      res.send({profileid: user.profile})
    } catch(error) {
      console.error("An error occurred:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  } else {
    res.status(201).send({msg: 'no token'})
  }
});

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({username: username}).exec()
    if (user) {
      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        return res.status(400).json({ error: "Password incorrect" })
      }
      const accessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET)
      res.json({ accessToken: accessToken })
    } else {
      return res.status(400).json({ error: "User incorrect" })
    }
  } catch (err) {
    console.log("Error finding user in database or comparing password", err)
    res.sendStatus(403)
  }
})

router.post('/sign-up', [
  body("username", "username is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password", "Password is required")
    .trim()
    .isLength({ min: 1 }),
  body("confirmpassword", "Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
    .escape(),
  body("firstname", "First name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastname", "Last name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.json({
        errors: errors.array()
      })
      return
    }

    const userExists = await User.findOne({ username: req.body.username }).exec()
    if (userExists) {
      res.send({ msg: "Username already in use!"})
      return
    }

    try {
      const profiledetail = new Profile({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        about: "",
        interests: ""
      })
      const profile = await profiledetail.save()
      console.log("New profile created")

      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const userdetail = new User({
        username: req.body.username,
        password: hashedPassword,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        profile: profile._id,
        friends: [],
        threads: []
      })
      const user = await userdetail.save()
      //res.redirect('/users/login')
      res.send({ msg: "success" })
      console.log(`Successfully created new user: ${user.firstname}`)
    } catch(err) {
      return next(err)
    }
  })
])

router.get('/profiles/:profileid', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const profile = await Profile.findById(req.params.profileid).exec()
      if (profile != null) {
        return res.send(profile)
      } else {
        console.log("Couldn't find profile.")
        return res.status(404).json({ error: "Couldn't find profile" })
      }
    } else {
      return res.status(400).json({ error: "Only members can see profiles. Please login." })
    }
  } catch (error) {
    console.error("An error occurred:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})


router.get('/threads/:threadid', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec()
      if (user !== null) {
        console.log(user.threads, req.params.threadid)
        if (user.threads.includes(req.params.threadid)) {
          const thread = await Thread.findById(req.params.threadid).exec()
          if (thread != null ) return res.send({ thread })
          else return res.status(404).json({ error: "Cannot find thread" })
        } else {
          return res.status(400).json({ error: "You are not part of this thread!" })
        }
      } else {
        return res.status(400).json({ error: "Cannot find user" })
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" })
    }
  } catch (error) {
    console.error("An error occurred:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

router.get('/profiles', authenticateToken, async function(req, res, next) {
  try {
    if (req.user != null) {
      const profiles = await Profile.find().exec();
      res.send(profiles);
    } else {
      return res.status(400).json({ error: "Only members can see profiles. Please login." });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/friends', authenticateToken, async function(req,res,next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();
      if (user != null) {
        const friends = await User.find({ _id: { $in: user.friends } }).exec();
        const data = { friends, user }
        res.send(data);
      } else {
        return res.status(400).json({ error: "Cannot find user" });
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
})

router.get('/threads', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();
      if (user != null) {
        const threads = await Thread.find({ _id: { $in: user.threads } }).exec();
        const data = { threads, user }
        res.send(data);
      } else {
        return res.status(400).json({ error: "Cannot find user" });
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Route to add a new thread
router.post('/threads', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const participants = req.body.userids; // Array of user ids participating in the thread
      const title = req.body.title;

      // Validate participants and title
      if (!participants || !Array.isArray(participants) || participants.length === 0 || !title) {
        return res.status(400).json({ error: "Invalid request. Please provide userids array and title." });
      }

      // Check if all participants exist
      const users = await User.find({ _id: { $in: participants } }).exec();
      if (users.length !== participants.length) {
        return res.status(400).json({ error: "Invalid userids. One or more users do not exist." });
      }

      // Create new thread
      const newThread = new Thread({
        title: title,
        participants: participants
      });
      const savedThread = await newThread.save();

      // Update user.threads for all participants
      await User.updateMany(
        { _id: { $in: participants } },
        { $push: { threads: savedThread._id } }
      ).exec();

      return res.status(201).json(savedThread);
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/threads/:threadid/messages', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();
      if (user != null) {
        const thread = await Thread.findById(req.params.threadid).exec();
        if (thread != null) {
          // Create new message
          if (!req.body.msg) {
            return res.status(400).json({ error: "Message content is required" });
          }
          
          const newMessage = {
            name: `${user.firstname} ${user.lastname}`,
            msg: req.body.msg
          };
          //console.log(thread.messages)

          // Add message to thread
          thread.messages.push(newMessage);
          const savedThread = await thread.save();

          const data = { success: true, thread: savedThread, user }
          res.status(200).send(data);
        } else {
          return res.status(404).json({ error: "Thread not found" });
        }
      } else {
        return res.status(400).json({ error: "Cannot find user" });
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/user/profile', authenticateToken, async function(req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();
      if (user != null) {
        const profile = await Profile.findById(user.profile).exec()
        const data = { success: true, user, profile }
        res.status(200).send(data);
      } else {
        return res.status(400).json({ error: "Cannot find user" });
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/user/profile', authenticateToken, async function(req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();
      if (user != null) {
        const profile = await Profile.findById(user.profile).exec()
        profile.image = req.body.image
        profile.interests = req.body.interests
        profile.about = req.body.about
        await profile.save()

        const data = { success: true, user }
        //console.log(data)
        return res.send(data);
      } else {
        return res.status(400).json({ error: "Cannot find user" });
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/user', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();
      if (user != null) {
        const data = { success: true, user }
        res.status(200).send(data);
      } else {
        return res.status(400).json({ error: "Cannot find user" });
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/notifications', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();
      if (user != null) {
        const friendRequests = await User.find({ _id: { $in: user.friendRequests } }).exec();

        const data = { success: true, user, friendRequests }
        res.status(200).send(data);
      } else {
        return res.status(400).json({ error: "Cannot find user" });
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/notifications/accept-friend', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();
      if (user != null) {
        // Check if the ID posted is in the friendRequests array
        const requestId = req.body.requestId; // Assuming you're passing the ID as 'requestId' in the request body
        const index = user.friendRequests.indexOf(requestId);
        if (index !== -1) {
          // If ID is found in friendRequests, remove it and add to friends
          user.friendRequests.splice(index, 1);
          user.friends.push(requestId);
          // Save the updated user object
          await user.save();

          // Add friend to the other user
          const user2 = await User.findById(requestId).exec();
          user2.friends.push(user._id)
          await user2.save()

          const data = { success: true }
          return res.status(200).send(data);
        } else {
          return res.status(400).json({ error: "Request ID not found in friend requests" });
        }
      } else {
        return res.status(400).json({ error: "Cannot find user" });
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/notifications/reject-friend', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();
      if (user != null) {
        // Check if the ID posted is in the friendRequests array
        const requestId = req.body.requestId; // Assuming you're passing the ID as 'requestId' in the request body
        const index = user.friendRequests.indexOf(requestId);
        if (index !== -1) {
          // If ID is found in friendRequests, remove it
          user.friendRequests.splice(index, 1);
          // Save the updated user object
          await user.save();
          const data = { success: true }
          return res.status(200).send(data);
        } else {
          return res.status(400).json({ error: "Request ID not found in friend requests" });
        }
      } else {
        return res.status(400).json({ error: "Cannot find user" });
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/add-friends', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();
      if (user != null) {
        const friends = user.friends
        friends.push(user._id)
        const nonFriends = await User.find({ _id: { $nin: friends } }).exec();

        const data = { success: true, user, nonFriends }
        res.status(200).send(data);
      } else {
        return res.status(400).json({ error: "Cannot find user" });
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/add-friends', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();
      if (user != null) {
        const friendId = req.body.friendId

        const friend = await User.findById(friendId).exec();

        // Check if friendId already exists in friendRequests
        if (!friend.friendRequests.includes(user._id)) {
          // If friendId doesn't exist, add it to friendRequests
          friend.friendRequests.push((user._id))
          await friend.save(); // Save the updated user document

          const data = { success: true }
          return res.status(200).send(data);
        } else {
          return res.status(400).json({ error: "Friend request already sent" });
        }
      } else {
        return res.status(400).json({ error: "Cannot find user" });
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/posts', authenticateToken, async function(req,res,next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();
      if (user != null) {
        const friends = await User.find({ _id: { $in: user.friends } }).exec();

        let postIds = [...user.posts]
        friends.forEach(friend => {
          postIds = postIds.concat(friend.posts)
        })

        const posts = await Post.find({ _id: { $in: postIds } }).exec();
        res.send(posts);
      } else {
        return res.status(400).json({ error: "Cannot find user" });
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
})

// Route to add a new post
router.post('/posts', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();

      if (user == null) {
        return res.status(400).json({ error: "Invalid user" });
      }

      const content = req.body.content;
      //console.log(content)

      // Validate content
      if (!content || content.length === 0) {
        return res.status(400).json({ error: "Invalid request. Please provide content" });
      }

      // Create new post
      const newPost = new Post({
        user: user._id,
        name: `${user.firstname} ${user.lastname}`,
        content: content,
        comments: [],
        likes: []
      });
      const savedPost = await newPost.save();

      user.posts.push(savedPost._id)
      await user.save()

      return res.status(201).json(savedPost);
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/posts/:postid', authenticateToken, async function(req,res,next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();
      if (user != null) {
        const post = await Post.findById(req.params.postid).exec();
        res.send(post);
      } else {
        return res.status(400).json({ error: "Cannot find user" });
      }
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
})

// Route to like a post
router.get('/posts/:postid/like', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();

      if (user == null) {
        return res.status(400).json({ error: "Invalid user" });
      }

      const post = await Post.findById(req.params.postid).exec();
      if (post == null) {
        return res.status(400).json({ error: "Can't find post" });
      }

      post.likes.push(user._id)
      await post.save()

      return res.status(200).json({success: true, post });
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Route to add comment to a post
router.post('/posts/:postid/comment', authenticateToken, async function (req, res, next) {
  try {
    if (req.user != null) {
      const user = await User.findOne({ username: req.user.username }).exec();

      if (user == null) {
        return res.status(400).json({ error: "Invalid user" });
      }

      const post = await Post.findById(req.params.postid).exec();
      if (post == null) {
        return res.status(400).json({ error: "Can't find post" });
      }

      const comment = req.body.comment;

      // Validate comment
      if (!comment || comment.length === 0) {
        return res.status(400).json({ error: "Invalid request. Please provide a comment" });
      }

      const newComment = {
        user: user._id,
        name: `${user.firstname} ${user.lastname}`,
        comment: comment
      }

      post.comments.push(newComment)
      await post.save()

      return res.status(200).json({success: true, post });
    } else {
      return res.status(400).json({ error: "You are not authorized!" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
