module.exports = async function(app, db) {
    app.get("/", (req, res) => {
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
    app.get("/hu", (req, res) => {
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
}