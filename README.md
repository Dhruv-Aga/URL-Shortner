URL Shortner

Very Basic App to give APIs to Hash the URL and make it Tiny for easy of sharing and usage.

This App uses technology like:

- Node.js
- Expres.js
- SQLite DB
- Cron

Implementation:

- By taking the advantage to SQl DB to generate a unique key every time which could be used directly or can be hashed again
- Add Cron to clear inactive URl at mid-night
- Single time hashes, i.e. if one hash is used once it will become inactive and eventually be deleted