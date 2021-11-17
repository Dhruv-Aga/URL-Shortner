const sqlite3 = require('sqlite3').verbose();
let isInitialise = false;


module.exports.DB = () => {
    const db = new sqlite3.Database('./db/urls.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        initialise()
        console.log('Connected to the in-memory SQlite database.');
    });

    const closeDB = () => {
        db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    }

    const initialise = () => {
        if(!isInitialise) {
            console.log(db)
            db.run('CREATE TABLE IF NOT EXISTS urls (url_id INTEGER PRIMARY KEY AUTOINCREMENT, actual_url TEXT NOT NULL, insertion_time text, is_active INTEGER DEFAULT 1);', (err) => {
                if (err) {
                    console.error("Initialising DB", err)
                } else {
                    module.exports.cleanUp()
                    db.run(`INSERT INTO urls (url_id, actual_url, insertion_time, is_active) VALUES (10000052, "demo", "${(new Date()).toUTCString()}", 0);`, (err) => {
                        if (err) {
                            console.error("Initialising DB", err)
                            if(err.code !== "SQLITE_CONSTRAINT") return
                        }
                        console.log("Completed Initialisation")
                        isInitialise = true

                    })
                }
            })
        }
    }

    return {
        getDB: () => db,
        closeDB: closeDB
    }
}

module.exports.cleanUp = () => {
    const db = module.exports.DB().getDB()
    setTimeout(() => {
        db.run('DELETE FROM urls WHERE is_active = 0;', (err) => {
            if (err) {
                console.error("Clean up", err)
            } else {
                console.info("Successfully Clean up")
            }
        })
    }, 1000)
}