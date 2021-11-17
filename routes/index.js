let express = require('express');
const {DB} = require("../plugins/db");
let router = express.Router();

const db = DB()

/**
 * This gives a hashed URL for any valid URL
 * @route GET /getTiny
 * @group URL Shortner - Operations about URL
 * @param {string} url.path.required - url - eg: https://www.npmjs.com/package/express-swagger-generator
 * @returns {object} 200 - json with hashed URL and complete URL
 * @returns {Error}  400 - URL is missing
 * @returns {Error}  402 - Invalid URL
 * @returns {Error}  default - Unexpected error
 */
router.get('/getTiny', function(req, res, next) {
  let data;
  if (req.data) {
    data = req.data
  } else {
    data =  req.query
  }
  const url = data["url"] || undefined

  if (!url) return res.sendStatus(400)

  try {
    let _ = new URL(url);
  } catch (_) {
    return res.sendStatus(402)
  }

  db.getDB().run(`INSERT INTO urls (actual_url, insertion_time) VALUES (?, ?);`, [url, (new Date()).toUTCString()], function(err) {
    if (err) {
      console.log(err.message);
      return res.sendStatus(500)
    }
    const newUrl = `/hs/${this.lastID}`
    return res.send({hashedUrl: newUrl, completeUrl: `${req.hostname}${newUrl}`})
  })
});


/**
 * This redirects to a Actual URL from Hashed URL
 * @route GET /hs/{url_id}
 * @group URL Shorter - Operations about URL
 * @param {string} url_id.required - ID/Key of hashed URL - eg: 10000066
 * @returns {object} 200 - redirect to actual URL
 * @returns {Error}  400 - URL ID is missing
 * @returns {Error}  default - Unexpected error
 */
router.get('/hs/:url_id', function(req, res, next) {
  const urlId = req.params.url_id;
  if (!urlId) return res.sendStatus(400)
  db.getDB().get(`SELECT actual_url from urls WHERE is_active = 1 AND url_id = ${urlId};`, [], function(err, row) {
    if (err) {
      console.log(err.message);
      return res.sendStatus(500)
    }

    // Only used mark in_active
    setImmediate(() => {
      db.getDB().run(`UPDATE urls SET is_active = 0 WHERE url_id = ${urlId};`, [], function(err) {
        if (err) {
          console.log(err.message);
        }
      })
    })

    if (row) return res.redirect(row["actual_url"])

    return res.sendStatus(404)
  })
});

module.exports = router;
