const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../configs/jwt");
const auth = require("../middleware/auth.middleware");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  res.status(201).json({ message: "User registered", token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.json({ token });
});

//get user from token
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-passwordHash")
      .lean();
    res.json(user);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

//get all users
router.get("/", auth, async (req, res) => {
  const users = await User.find().select("-passwordHash").lean();
  res.json(users);
});

module.exports = router;
