const https = require("https");

const NAVER_CLIENT_ID     = "zBAA37oEfAYR7jgEp5g1";
const NAVER_CLIENT_SECRET = "XiFlhQ957X";

module.exports = function (req, res) {
  const query   = req.query.q     || "";
  const display = req.query.count || 6;

  const options = {
    hostname: "openapi.naver.com",
    path: `/v1/search/image?query=${encodeURIComponent(query)}&display=${display}&filter=large&sort=sim`,
    headers: {
      "X-Naver-Client-Id":     NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    },
  };

  https.get(options, function (naverRes) {
    let data = "";
    naverRes.on("data", function (chunk) { data += chunk; });
    naverRes.on("end", function () {
      try {
        res.json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ error: "Parse error" });
      }
    });
  }).on("error", function (err) {
    res.status(500).json({ error: err.message });
  });
};
