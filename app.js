const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "thisismysecrettoken", // Replace with your own secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set secure: true for HTTPS connections
  })
);

// Serve static files from the "public" directory
app.use(express.static("public"));

// Simulated user data (replace with your own database or storage)
let users = [
  {
    id: 1,
    email: "test@gmail.com",
    password: "$2a$10$4u6v95UPrBQYHXCrD9DQre45lEFTX1tXfMm6LTCef7X0YHN7hY54S",
  }, // Hashed version of "password1"
  {
    id: 2,
    email: "user2@example.com",
    password: "$2a$10$E.gUoHfFfJNS3N4yAD.nKu/5Vc8k7m87z6pJHJRU8vnab0veDpOai",
  }, // Hashed version of "password2"
];

// Generate a unique ID for new users
let nextUserId = users.length + 1;

// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
  if (req.session.userId) {
    // User is logged in
    console.log(
      "Index ----------------------------------------------------------------"
    );
    next();
  } else {
    console.log(
      "Login ----------------------------------------------------------------"
    );
    // User is not logged in
    res.redirect("/login");
  }
};

app.get("/", (req, res) => {
  console.log("Welcome");

  res.sendFile(__dirname + "/public/index.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

//login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(users);

  // Find the user with the provided email
  const user = users.find((user) => user.email === email);

  if (!user) {
    // User not found
    return res.status(401).send("Invalid email or password");
  }

  // Compare the provided password with the stored hashed password
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err) {
      console.error("Error comparing passwords:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (isMatch) {
      // Store the user ID in the session
      req.session.userId = user.id;

      // Password matches, login successful
      res.status(200).send("Login successful");
    } else {
      // Invalid password
      res.status(401).send("Invalid email or password");
    }
  });
});

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});

// Signup route
app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  console.log(users);

  // Check if the email is already registered
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    // Email already registered
    return res.status(409).send("Email already registered");
  }

  // Generate a salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.error("Error generating salt:", err);
      return res.status(500).send("Internal Server Error");
    }

    // Hash the password using the generated salt
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Create a new user object with hashed password
      const newUser = { email, password: hash };

      // Store the new user in the list of users
      users.push(newUser);

      res.status(201).send("Signup successful");
    });
  });
});

// Logout route
app.post("/logout", (req, res) => {
  // Clear the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Failed to destroy session:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.sendStatus(200);
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
