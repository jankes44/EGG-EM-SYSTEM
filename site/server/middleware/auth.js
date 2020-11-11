const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    console.log("1")
    const bearerToken = bearer[1];
    req.token = bearerToken;
    console.log("2", bearerToken, process.env.ACCESS_TOKEN_SECRET)
    jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, (err) => {
      if (err){
        console.log("3")
        res.sendStatus(403);
      }
      else {
          next();
      }
    })
  } else {
    console.log("4")
    res.sendStatus(403);
  }
};
