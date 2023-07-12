const { default: axios } = require("axios");
const bodyParser = require("body-parser");
const express = require("express");
const { decode } = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.type("html").send("Hello from AWS Apple SignIn"));

app.post("/auth/apple/callback", async (req, res) => {
  console.log("req", req);
  const { user, id_token, code } = req.body;


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

      return res.redirect(`https://www.qa2.jobtrees.com`);
    }
  } else {
    // we can get only email by decdoing the token for the subsequent requests
    const tokenEndpoint = "https://appleid.apple.com/auth/token";
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    
    try {
      const response = await axios.post(tokenEndpoint, params);
      const { access_token, id_token } = response.data;
      
      // Decode the JWT to get user information
      const decodedToken = decode(id_token);
      const user = decodedToken.sub;
      
      // Respond with a success message or redirect
      res.send("Login successful!");
      console.log("user", user);
    } catch (error) {
      console.error("Apple login error:", error.message);
      res.status(500).send("Error occurred during login.");
    }
    // const parsedToken = decode(id_token);
    // email = parsedToken.email;
  }

  console.log({ email, fname, lname });
  return res.redirect(
    `https://www.qa2.jobtrees.com?fname=${fname}&lname=${lname}&email=${email}&state=appleSignIn`
  );
});

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;