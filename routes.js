const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const pug = require('pug');

let CLIENT_ID = null;
let CLIENT_SECRET = null;
let REDIRECT_URI = null;

if (process.env.USE_ENV && process.env.USE_ENV == "true") {
    CLIENT_ID = process.env.CLIENT_ID;
    CLIENT_SECRET = process.env.CLIENT_SECRET;
    REDIRECT_URI = process.env.REDIRECT_URI;
} else if (!process.env.USE_ENV) {
    filePath = path.join(__dirname, 'oauth.key');
    split = fs.readFileSync(filePath, { encoding: "utf8" }).split(";");
    CLIENT_ID = split[0];
    CLIENT_SECRET = split[1];
    REDIRECT_URI = "http://localhost:8080/redirect";
}

module.exports = async function(app, db) {
    app.get("/", (req, res) => {
        const lang = req.cookies.lang || 0;
        const langString = lang == 0 ? "en" : "hu";
        checkIfLoggedIn(req, res, function(author) {
            var author = author || false;
            getRandomExcuse(langString, function(excuse) {
                res.render('index', { title: "Generate Excuses", profile: author, excuse: excuse, lang: langString });
            })
        })
    });
    app.get("/profile", (req, res) => {
        const lang = req.cookies.lang || 0;
        const offset = req.query.offset || 0;
        const count = req.query.count || 10;
        const langString = lang == 0 ? "en" : "hu";
        checkIfLoggedIn(req, res, function(profile) {
            var profile = profile || false;

            if (profile)
                getOffsetExcusesOwn(function(excuses) {
                    res.render('profile', { title: "Profile View", profile: profile, excuses: excuses, lang: langString });
                }, offset, count, profile.ID)
            else
                res.redirect("/");
        })
    });
    app.get("/admin", (req, res) => {
        const lang = req.cookies.lang || 0;
        const langString = lang == 0 ? "en" : "hu";
        const excusesOffset = req.query.excusesOffset || 0;
        const excusesCount = req.query.excusesCount || 10;
        const usersOffset = req.query.usersOffset || 0;
        const usersCount = req.query.usersCount || 10;
        checkIfLoggedIn(req, res, (profile) => {
            if (profile && profile.admin) {
                getOffsetExcuses(function(excuses) {
                    getOffsetProfiles(function(users) {
                        res.render('admin', { title: "Admin Panel", profile: profile, users: users, excuses: excuses, lang: langString });
                    }, usersOffset, usersCount)
                }, excusesOffset, excusesCount)
            } else
                res.sendStatus(403);
        })
    });
    app.get("/add", (req, res) => {
        const lang = req.cookies.lang || 0;
        const langString = lang == 0 ? "en" : "hu";
        checkIfLoggedIn(req, res, function(profile) {
            if (!profile)
                res.redirect("/");
            else
                res.render('add_new', { profile: profile, lang: langString });
        })
    })
    app.post("/add", (req, res) => {
        checkIfLoggedIn(req, res, function(profile) {
            if (!profile) {
                res.sendStatus(401);
                return;
            }
            const lang = req.query.lang;
            const excuse = req.query.excuse;
            if (lang && (lang == "en" || lang == "hu") && excuse && excuse.length > 6) {
                db.query("INSERT INTO excuses (\"excuse\", \"lang\", \"added_by\", \"verified\") VALUES($1,$2,$3,$4)", [excuse, lang, profile.ID, profile.admin], function(dberr, dbres) {
                    if (!dberr)
                        res.sendStatus(200);
                    else
                        res.sendStatus(500);
                })
            } else
                res.sendStatus(400)
        })
    })
    app.post("/verify", (req, res) => {
        checkIfLoggedIn(req, res, function(profile) {
            const ID = req.query.ID;
            const currentStatus = (req.query.verified === 'true');
            if (!profile) { // If the user is not authorized
                res.sendStatus(401);
                return;
            }
            if (!profile.admin) // If the user is not an admin
            {
                res.sendStatus(403);
                return;
            }
            if (currentStatus == null || !ID) // If one of the parameters was not satisfied
            {
                res.sendStatus(400);
                return;
            }
            db.query("UPDATE excuses SET \"verified\"=$1 WHERE \"ID\"=$2", [!currentStatus, ID], function(dber, dbres) {
                if (!dber) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(500);
                }
            })
        })
    })
    app.post("/delete", (req, res) => {
        checkIfLoggedIn(req, res, function(profile) {
            const ID = req.query.ID;
            if (!profile) { // If the user is not authorized
                res.sendStatus(401);
                return;
            }
            if (!profile.admin) // If the user is not an admin
            {
                res.sendStatus(403);
                return;
            }
            if (!ID) // If the parameter was not satisfied
            {
                res.sendStatus(400);
                return;
            }
            db.query("DELETE FROM excuses WHERE \"ID\"=$1", [ID], function(dber, dbres) {
                if (!dber) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(500);
                }
            })
        })
    })
    app.get("/getexcuse", (req, res) => {
        getRandomExcuse("en", function(excuse) {
            if (excuse != null)
                res.send(excuse);
            else
                res.sendStatus(500);
        })
    });
    app.get("/getexcuse_hu", (req, res) => {
        getRandomExcuse("hu", function(excuse) {
            if (excuse != null)
                res.send(excuse);
            else
                res.sendStatus(500);
        })
    });
    app.get("/change_language", (req, res) => {
        const lang = req.query.lang;
        if (lang && (lang == 0 || lang == 1)) {
            res.cookie('lang', lang).sendStatus(200);
        } else {
            res.sendStatus(500);
        }
    });
    app.get("/redirect", (req, res) => {
        let url = "https://oauth2.googleapis.com/token?" +
            "code=" + req.query.code + "&" +
            "client_id=" + CLIENT_ID + "&" +
            "client_secret=" + CLIENT_SECRET + "&" +
            "redirect_uri=" + REDIRECT_URI + "&" +
            "grant_type=" + "authorization_code";
        axios({
                method: 'POST',
                url: url,
                headers: {
                    accept: 'application/json'
                }
            }).catch((error) => {
                console.log(error);
            })
            .then((response) => {
                const accessToken = response.data.access_token;
                const refreshToken = response.data.refresh_token;
                axios({
                        method: "GET",
                        url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
                        headers: {
                            Authorization: 'Bearer ' + accessToken
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    })
                    .then((response) => {
                        //console.log(response)
                        db.query("SELECT * FROM users WHERE \"ID\"=$1", [response.data.id], function(dberr, dbres) {
                            if (!dberr) {
                                var hash = crypto.randomBytes(20).toString('hex');
                                if (dbres.rowCount == 0) // Not registered yet
                                {
                                    db.query("INSERT INTO \"users\" (\"ID\", \"email\", \"picture\", \"hash\", \"token\", \"refresh_token\") VALUES($1, $2, $3, $4, $5, $6)", [response.data.id, response.data.email, response.data.picture, hash, accessToken, refreshToken],
                                        function(dberr, dbres) {
                                            if (!dberr)
                                                res.cookie('hash', hash).redirect("/");
                                            else {
                                                console.log(dberr);
                                                res.redirect("/");
                                            }
                                        });
                                } else {
                                    db.query("UPDATE users SET \"hash\"=$1 WHERE \"ID\"=$2", [hash, response.data.id], function(dber, dbres) {
                                        if (!dberr)
                                            res.cookie('hash', hash).redirect("/");
                                        else {
                                            console.log(dberr)
                                            res.sendStatus(500);
                                        }
                                    })

                                }
                            } else {
                                console.log(dberr);
                                res.redirect("/");
                            }
                        });
                    })
            })
    })
    app.get("/oauth", (req, res) => {
        const requestToken = req.query.code;
        let url = "https://accounts.google.com/o/oauth2/v2/auth?" +
            "client_id=" + CLIENT_ID + "&" +
            "redirect_uri=" + REDIRECT_URI + "&" +
            "scope=" + "https://www.googleapis.com/auth/userinfo.profile email openid" + "&" +
            "access_type=" + "offline" + "&" +
            "response_type=" + "code";
        res.redirect(url);
    });
    app.post("/register", (req, res) => {
        const username = req.query.username;
        const hash = req.cookies.hash || "";
        if (username && username.length > 3 && username.length < 20 && hash != "") {
            db.query("SELECT * FROM users WHERE \"hash\"=$1", [hash], function(dberr, dbres) {
                if (!dberr) {
                    db.query("UPDATE users SET \"username\"=$1 WHERE \"hash\"=$2 ", [username, hash], function(dberr, dbres) {
                        if (!dberr)
                            res.sendStatus(200);
                        else
                            res.sendStatus(500);
                    })
                } else {
                    res.sendStatus(403);
                }
            })
        } else {
            res.sendStatus(403);
        }
    });
    app.post("/logout", (req, res) => {
        const hash = req.cookies.hash || "";
        if (hash) {
            db.query("UPDATE users SET \"hash\"=NULL WHERE \"hash\"=$1", [hash], function(dberr, dbres) {
                if (!dberr)
                    res.cookie('hash', null).redirect("/");
                else {
                    console.log(dberr);
                    res.sendStatus(500);
                }
            });

        } else
            res.redirect("/");
    });

    function getRandomExcuse(lang, cb) {
        db.query("SELECT * FROM excuses WHERE \"lang\"=$1 AND \"verified\"=true ORDER BY RANDOM() LIMIT 1", [lang], function(dberr, dbres) {
            if (!dberr) {;
                if (dbres.rowCount > 0) {
                    cb(dbres.rows[0].excuse);
                } else {
                    cb("Sorry but we couldn't find an excuse. You're screwed.")
                }
            } else {
                console.log(dberr);
                cb(null);
            }
        });
    }

    function getOffsetExcuses(cb, offset, count) {
        db.query("SELECT * FROM excuses ORDER BY \"verified\" OFFSET $1 ROWS FETCH FIRST $2 ROWS ONLY", [offset, count], function(dberr, dbres) {
            if (!dberr) {;
                if (dbres.rowCount > 0) {
                    cb(dbres.rows);
                } else {
                    cb(null)
                }
            } else {
                console.log(dberr);
                cb(null);
            }
        });
    }

    function getOffsetExcusesOwn(cb, offset, count, owner) {
        db.query("SELECT * FROM excuses WHERE \"added_by\"=$1 ORDER BY \"verified\" OFFSET $2 ROWS FETCH FIRST $3 ROWS ONLY", [owner, offset, count], function(dberr, dbres) {
            if (!dberr) {
                if (dbres.rowCount > 0) {
                    cb(dbres.rows);
                } else {
                    cb(null);
                }
            } else {
                console.log(dberr);
                cb(null);
            }
        });
    }

    function getOffsetProfiles(cb, offset, count) {
        db.query("SELECT * FROM users ORDER BY \"ID\" OFFSET $1 ROWS FETCH FIRST $2 ROWS ONLY", [offset, count], function(dberr, dbres) {
            if (!dberr) {
                if (dbres.rowCount > 0) {
                    cb(dbres.rows);
                } else {
                    cb(null);
                }
            } else {
                console.log(dberr);
                cb(null);
            }
        })
    }

    function checkIfLoggedIn(req, res, cb) {
        if (req.cookies && req.cookies.hash) {
            db.query("SELECT * FROM users WHERE \"hash\"=$1", [req.cookies.hash], function(dberr, dbres) {
                if (!dberr && dbres.rowCount == 1)
                    cb(dbres.rows[0])
                else if (!dberr) {
                    console.error("Error when checking loggedin: duplicate hashes")
                    cb(null);
                }
            })
        } else {
            cb(null);
        }
    }

}