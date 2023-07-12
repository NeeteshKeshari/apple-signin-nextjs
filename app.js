const bodyParser = require("body-parser");
const express = require("express");
const { decode } = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.type("html").send("Hello from AWS Apple SignIn"));

const clientId = 'com.web.jobtrees';


app.post("/auth/apple/callback", async (req, res) => {
  const { authorizationCode } = req.body;
  console.log("data:", req, res);
  try {
    // Exchange authorization code for access token and ID token
    const tokenResponse = await axios.post("https://appleid.apple.com/auth/token", {
      client_id: clientId,
      code: authorizationCode,
      grant_type: "authorization_code",
    });

    const { id_token } = tokenResponse.data;
    const decodedToken = decode(id_token);
    const user = decodedToken.email;

    console.log("User:", user);
    console.log("ID Token:", id_token);

    res.json({ user, id_token });

  let fname = "";
  let lname = "";
  let email = "";

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

      return res.redirect(`https://www.qa2.jobtrees.com`);
    }
  } else {
    console.log(id_token, user);
    const parsedToken = decode(id_token);
    // email = parsedToken.email;
  }
  console.log({ email, fname, lname });
  return res.redirect(
    `https://www.qa2.jobtrees.com?fname=${fname}&lname=${lname}&email=${email}&state=appleSignIn`
  );
} catch (error) {
  console.error("Apple Login Error:", error);
  res.status(500).json({ error: "Failed to authenticate with Apple" });
}
});

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;