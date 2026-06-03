const express = require("express");
const cors = require("cors");
//CORS PROBLEM
//in your report you can say that because of cors problem, we had to use node.js and start different server in order to get naver images.
const https = require("https");

const app = express();
app.use(cors());

const NAVER_CLIENT_ID = "zBAA37oEfAYR7jgEp5g1";
const NAVER_CLIENT_SECRET = "XiFlhQ957X";

app.get("/api/photos", (req, res) => {
  const query = req.query.q || "";
  const display = req.query.count || 6;

  const options = {
    hostname: "openapi.naver.com",
    path: `/v1/search/image?query=${encodeURIComponent(query)}&display=${display}&filter=large&sort=sim`,
    headers: {
      "X-Naver-Client-Id": NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    },
  };

  https
    .get(options, (naverRes) => {
      let data = "";
      naverRes.on("data", (chunk) => (data += chunk));
      naverRes.on("end", () => {
        try {
          res.json(JSON.parse(data));
        } catch {
          res.status(500).json({ error: "Parse error" });
        }
      });
    })
    .on("error", (err) => {
      res.status(500).json({ error: err.message });
    });
});

app.listen(3000, () =>
  console.log("SPOT-FINDER NAVER IMAGES → http://localhost:3000"),
);
