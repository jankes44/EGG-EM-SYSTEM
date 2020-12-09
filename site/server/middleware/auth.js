const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    jwt.verify(bearerToken, process.env.SECRET_KEY, (err) => {
      if (err){
        res.sendStatus(403);
      }
      else {
          next();
      }
    })
  } else {
    res.sendStatus(403);
  }
};