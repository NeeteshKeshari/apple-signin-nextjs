const { default: axios } = require("axios");
const bodyParser = require("body-parser");
const express = require("express");
const { decode } = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.type("html").send("Hello from AWS Apple"));

app.post("/auth/apple/callback", async (req, res) => {
  const { user, id_token } = req.body;

  let fname = "";
  let lname = "";
  let email = "";

  // user object will only be there when it's first request for that unique user
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      if (parsedUser) {
        fname = parsedUser["name"]?.["firstName"];
        lname = parsedUser["name"]?.["lastName"];
        email = parsedUser["email"];
      }
    } catch (err) {
      console.log(err);

      return res.redirect(`http://localhost:3000`);
    }
  } else {
    // we can get only email by decdoing the token for the subsequent requests
    const parsedToken = decode(id_token);
    email = parsedToken.email;
  }

  console.log({ email, fname, lname });
  return res.redirect(
    `http://localhost:3000?fname=${fname}&lname=${lname}&email=${email}&state=appleSignIn`
  );
});

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;