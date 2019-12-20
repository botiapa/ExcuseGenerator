const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const pug = require('pug');

let CLIENT_ID = null;
let CLIENT_SECRET = null;
let REDIRECT_URI = null;

if(process.env.USE_ENV && process.env.USE_ENV == "true") {
    CLIENT_ID = process.env.CLIENT_ID;
    CLIENT_SECRET = process.env.CLIENT_SECRET;
    REDIRECT_URI = process.env.REDIRECT_URI;
}
else if(!process.env.USE_ENV) {
    filePath = path.join(__dirname, 'oauth.key');
    split = fs.readFileSync(filePath, {encoding: "utf8"}).split(";");
    CLIENT_ID = split[0];
    CLIENT_SECRET = split[1];
    REDIRECT_URI = "http://localhost:8080/redirect";
}


module.exports = async function(app, db) {
    app.get("/", (req, res) => 
    {
        checkIfLoggedIn(req,res, function(author) 
        {
            var author = author || false;
            console.log(author);
            res.render('index', {title:"Generate Excuses", profile:author});
        })
    });
    app.get("/getexcuse", (req, res) => {
        sendRandomExcuse(res, "en");
    });
    app.get("/getexcuse_hu", (req, res) => {
        sendRandomExcuse(res, "hu");
    });
    app.get("/change_language", (req, res) => {
        const lang = req.query.lang;
        if(lang && (lang == 0 || lang == 1)) 
        {
            res.cookie('lang', lang).sendStatus(200);
        }
        else 
        {
            res.sendStatus(500);
        }
    });
    app.get("/redirect", (req, res) => {
        let url = "https://oauth2.googleapis.com/token?"
        + "code=" + req.query.code + "&"
        + "client_id=" + CLIENT_ID + "&"
        + "client_secret=" + CLIENT_SECRET + "&"
        + "redirect_uri=" + REDIRECT_URI + "&"
        + "grant_type=" + "authorization_code";
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
                db.query("SELECT * FROM users WHERE \"ID\"=$1", [response.data.id], function(dberr, dbres)
                {
                    if(!dberr) {
                        var hash = crypto.randomBytes(20).toString('hex');
                        if(dbres.rowCount == 0) // Not registered yet
                        {
                            db.query("INSERT INTO \"users\" (\"ID\", \"email\", \"picture\", \"hash\", \"token\", \"refresh_token\") VALUES($1, $2, $3, $4, $5, $6)",
                            [response.data.id, response.data.email, response.data.picture, hash, accessToken, refreshToken],
                            function(dberr, dbres) {
                                if(!dberr) 
                                    res.cookie('hash', hash).redirect("/");
                                else 
                                {
                                    console.log(dberr);
                                    res.redirect("/");
                                }
                            });
                        }
                        else
                        {
                            db.query("UPDATE users SET \"hash\"=$1 WHERE \"ID\"=$2", [hash, response.data.id], function(dber, dbres) 
                            {
                                if(!dberr) 
                                    res.cookie('hash', hash).redirect("/");
                                else
                                {
                                    console.log(dberr)
                                    res.sendStatus(500);
                                }
                            })
                            
                        }
                    }
                    else
                    {
                        console.log(dberr);
                        res.redirect("/");
                    }
                });
            })
          })
    })
    app.get("/oauth", (req,res) => {
        const requestToken = req.query.code;
        let url = "https://accounts.google.com/o/oauth2/v2/auth?"
        + "client_id=" + CLIENT_ID + "&"
        + "redirect_uri=" + REDIRECT_URI + "&"
        + "scope=" + "https://www.googleapis.com/auth/userinfo.profile email openid" + "&"
        + "access_type=" + "offline" + "&"
        + "response_type=" + "code";
        res.redirect(url);
    });
    app.post("/register", (req,res) => {
        const username = req.query.username;
        const hash = req.cookies.hash || "";
        if(username && username.length > 3 && username.length < 20 && hash != "") 
        {
            db.query("SELECT * FROM users WHERE \"hash\"=$1", [hash], function(dberr, dbres) {
                if(!dberr) 
                {
                    db.query("UPDATE users SET \"username\"=$1 WHERE \"hash\"=$2 ", [username, hash], function(dberr, dbres) 
                    {
                        if(!dberr)
                            res.sendStatus(200);
                        else
                            res.sendStatus(500);
                    })
                }
                else 
                {
                    res.sendStatus(403);
                }
            })
        }
        else {
            res.sendStatus(403);
        }
    });
    app.post("/logout", (req,res) => {
        const hash = req.cookies.hash || "";
        if(hash)
        {
            db.query("UPDATE users SET \"hash\"='' WHERE \"hash\"=$1", [hash], function(dberr, dbres) 
            {
                if(!dberr) 
                    res.cookie('hash', null).redirect("/");
                else 
                {
                    console.log(dberr);
                    res.sendStatus(500);
                }
            });
            
        }
        else
            res.redirect("/");
    });
    app.get("/profile_info", (req, res) => {
        const hash = req.cookies.hash || "";
        if(hash != "") 
        {
            db.query("SELECT * FROM users WHERE \"hash\"=$1", [hash], function(dberr, dbres) {
                if(!dberr && dbres.rowCount == 1) 
                {
                    const userObject = {
                        email: dbres.rows[0].email,
                        username: dbres.rows[0].username,
                        picture: dbres.rows[0].picture};
                    res.send(userObject);
                }
                else 
                {
                    console.log(dberr);
                    res.sendStatus(500);
                }
            })
        }
        else 
        {
            res.sendStatus(403);
        }
    });

    function sendRandomExcuse(res, lang) 
    {
        db.query("SELECT * FROM excuses WHERE \"lang\"=$1 ORDER BY RANDOM() LIMIT 1", [lang], function(dberr, dbres)
        {
            if(!dberr) 
            {;
                if(dbres.rowCount > 0) {
                    res.send(dbres.rows[0].excuse);
                }
                else {
                    res.send("Sorry but we couldn't find an excuse. You're screwed.")
                }
            }
            else 
            {
                console.log(dberr);
                res.sendStatus(500);const hash = req.cookies.hash || "";
            }
        });
    }
    function checkIfLoggedIn(req, res, cb) 
    {
        if(req.cookies.hash) 
        {
            db.query("SELECT * FROM users WHERE \"hash\"=$1", [req.cookies.hash], function(dberr, dbres) 
            {
                if(!dberr && dbres.rowCount == 1) 
                    cb(dbres.rows[0])
                else if(!dberr) {
                        console.error("Error when checking loggedin: duplicate hashes")
                        cb(null);
                }
            })
        }
        else
            cb(null);
    }
}