const fs = require('fs');
const path = require('path');
const axios = require('axios');

let CLIENT_ID = null;
let CLIENT_SECRET = null;

if(process.env.USE_ENV && process.env.USE_ENV == "true") {
    CLIENT_ID = process.env.CLIENT_ID;
    CLIENT_SECRET = process.env.CLIENT_SECRET;
}
else if(!process.env.USE_ENV) {
    filePath = path.join(__dirname, 'oauth.key');
    split = fs.readFileSync(filePath, {encoding: "utf8"}).split(";");
    CLIENT_ID = split[0];
    CLIENT_SECRET = split[1];
}


module.exports = async function(app, db) {
    app.get("/getexcuse", (req, res) => {
        db.query("SELECT * FROM excuses_en ORDER BY RANDOM() LIMIT 1", function(dberr, dbres)
        {
            if(!dberr) 
            {
                res.send(dbres.rows[0].excuse);
            }
            else 
            {
                console.log(dberr);
                res.sendStatus(500);
            }
        });
    });
    app.get("/getexcuse_hu", (req, res) => {
        db.query("SELECT * FROM excuses_hu ORDER BY RANDOM() LIMIT 1", function(dberr, dbres)
        {
            if(!dberr) 
            {
                res.send(dbres.rows[0].excuse);
            }
            else 
            {
                console.log(dberr);
                res.sendStatus(500);
            }
        });
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
        + "redirect_uri=" + "http://localhost:8080/redirect" + "&"
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
            axios({
                method: "GET",
                url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
                headers: {
                    Authorization: 'Bearer ' + accessToken
                }
            }).then((response) => {
                console.log(response)
                db.query("SELECT * FROM users WHERE \"email\"=" + res.data.email, )
                db.query("INSERT INTO users (\"\")", function(dberr, dbres)
                {
                    if(!dberr) 
                    {
                        res.send(dbres.rows[0].excuse);
                    }
                    else 
                    {
                        console.log(dberr);
                        res.sendStatus(500);
                    }
                });
            })
            res.redirect("/")
          })
    })
    app.get("/oauth", (req,res) => {
        const requestToken = req.query.code;
        let url = "https://accounts.google.com/o/oauth2/v2/auth?"
        + "client_id=" + CLIENT_ID + "&"
        + "redirect_uri=" + "http://localhost:8080/redirect" + "&"
        + "scope=" + "https://www.googleapis.com/auth/userinfo.profile email openid" + "&"
        + "access_type=" + "offline" + "&"
        + "response_type=" + "code";
        res.redirect(url);
        
    })
}