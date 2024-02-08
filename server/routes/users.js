var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const asyncHandler = require('express-async-handler')
const { body, validationResult } = require('express-validator');

const User = require('../models/user');
const Profile = require('../models/profile');
const Thread = require('../models/thread');

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

module.exports = router;
