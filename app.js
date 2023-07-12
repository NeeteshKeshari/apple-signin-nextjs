// const bodyParser = require("body-parser");
// const express = require("express");
// const { decode } = require("jsonwebtoken");

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: false }));

// app.get("/", (req, res) => res.type("html").send("Hello from AWS Apple SignIn"));

// app.post("/auth/apple/callback", async (req, res) => {
//   console.log("req", req);
//   const { user, id_token } = req.body;

//   let fname = "";
//   let lname = "";
//   let email = "";

//   // user object will only be there when it's first request for that unique user
//   if (user) {
//     try {
//       const parsedUser = JSON.parse(user);
//       if (parsedUser) {
//         fname = parsedUser["name"]?.["firstName"];
//         lname = parsedUser["name"]?.["lastName"];
//         email = parsedUser["email"];
//       }
//     } catch (err) {
//       console.log(err);

//       return res.redirect(`https://www.qa2.jobtrees.com`);
//     }
//   } else {
//     // we can get only email by decdoing the token for the subsequent requests
//     const parsedToken = decode(id_token);
//     email = parsedToken.email;
//   }

//   console.log({ email, fname, lname });
//   return res.redirect(
//     `https://www.qa2.jobtrees.com?fname=${fname}&lname=${lname}&email=${email}&state=appleSignIn`
//   );
// });

// const server = app.listen(port, () =>
//   console.log(`Example app listening on port ${port}!`)
// );

// server.keepAliveTimeout = 120 * 1000;
// server.headersTimeout = 120 * 1000;




const express = require("express")
const jwksClient = require("jwks-rsa");
const jwt = require("jsonwebtoken");


const app = express();
const PORT = 3000;


async function key(kid) {
  const client = jwksClient({
    jwksUri: "https://appleid.apple.com/auth/keys",
    timeout: 30000
  });

  return await client.getSigningKey(kid);
} 

app.post("/auth/apple", async (req, res) => {
  const { id_token } = req.body
  const { header } = jwt.decode(id_token, {
    complete: true
  })

  const kid = header.kid
  const publicKey = (await key(kid)).getPublicKey()
  console.log(publicKey)

  const { sub, email } = jwt.verify(id_token, publicKey);
  return { sub, email }
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))