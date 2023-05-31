const express = require("express");
const app = express();
const PORT = 3000;
const { User } = require("./models");
const bcrypt = require(`bcrypt`);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
// middleware
app.use(express.json());
// intercepting a route, before you hit the request and response
passport.use(
  new LocalStrategy(async (email, password, done) => {
    const userToFind = await User.findOne({
      where: {
        email: email,
      },
    });
    const passwordMatch = await bcrypt.compare(password, userToFind.password);
    if (passwordMatch) {
      return done(null, userToFind);
    } else {
      return done(null, false, {
        message: "Email or password did not match. Please try again.",
      });
    }
  })
);

passport.serializeUser((user,done) => {
    done(null,user.id)
})
passport.deserializeUser(async (user, done) => {
    const userToFind = await.User.findOne({
        where: {
            id: user.id,
        }
    })
});

app.use(passport.initialize())
app.use(passport.session());


function authenticate(req, res, next) {
passport.authentication("local", (err,user,info)=> {
    if(err){
        return next(err)
    }
    if (!user) {
        return res.status(401).json({
            message:"Email or password did not match. Please try again.",
        })
    }
    req.logIn(user, (err) => {})
})
}

app.post("/sign_up", async (req, res) => {
  // expect the user to send in the req.body
  // an email and password
  const { email, password } = req.body;
  if (!email) {
    res.status(400).send("Please include an email");
    return;
  }
  if (!password) {
    res.status(400).send("Please include a password");
    return;
  }

  // hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const userToCreate = { email: email, password: hashedPassword };

  const newUser = await User.create(userToCreate);

  res.json({ message: `User successfully created with id ${newUser.id}` });
});

app.post("/login", authenticte, async (req, res) => {
  // we need to accept an emailand a password");
  const { email, password } = req.body;
  if (!email) {
    res.status(400).send("Please include an email");
    return;
  }
  if (!password) {
    res.status(400).send("Please include a password");
    return;
  }
  const userToFind = await User.findOne({
    where: {
      email: email,
    },
  });
  // compare the user password that is coming in
  // to the user password that we found in the database on line 52
  // this returns true if itmatches, falseif it doesn't

  const passwordMatch = await bcrypt.compare(password, userToFind.password);
  if (!passwordMatch) {
    res.status(403).send("That is the wrong password. Try again.");
    return;
  }
  // this is where we start the passport session
  //res.json(passwordMatch);
  res.json({ message: "Login successful" });
});

app.post("/", authenticate, (req, res) => {
  res.json({ message: "Login successful" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
