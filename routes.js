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
        res.sendStatus(200);
    });
}