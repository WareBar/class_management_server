const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(express.json(), cors());

let users = [];

// POST: Add or update a user
app.post("/users", (req, res) => {
  const { firstName, lastName, section, status } = req.body;

  if (!firstName || !lastName || !section || !status) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const userIndex = users.findIndex(
    (user) =>
      user.firstName.toLowerCase() === firstName.toLowerCase() &&
      user.lastName.toLowerCase() === lastName.toLowerCase()
  );

  if (userIndex !== -1) {
    users[userIndex].status = status;
    return res.status(200).json({
      message: `Attendance for ${lastName}, ${firstName} updated to ${status}`,
      users,
    });
  }

  const newUser = {
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    firstName,
    lastName,
    section,
    status,
  };

  users.push(newUser);
  res.status(201).json({
    message: `New student ${lastName}, ${firstName} added with status: ${status}`,
    users,
  });
});

// GET: All users
app.get("/users", (req, res) => {
  res.status(200).json(users);
});

// Root
app.get("/", (req, res) => {
  res.send("Server is up and running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
