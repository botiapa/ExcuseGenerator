const fs = require('fs');
const { Pool, Client } = require('pg');
const path = require('path')

module.exports = {
    Pool : null,
    init : async function()
	{
		filePath = path.join(__dirname, 'auth.key');

		var SERVER;
		var DATABASE;
		var UID;
		var PASSWORD;
		var DBPORT;

		if(process.env.USE_ENV == null || process.env.USE_ENV == false)
		{
			console.log("Using auth.key file for config");
			split = fs.readFileSync(filePath, {encoding: "utf8"}).split(";");
			SERVER = split[0];
			DATABASE = split[1];
			UID = split[2];
			PASSWORD = split[3];
			DBPORT = split[4];
			this.pool = new Pool({
			  user: UID,
			  host: SERVER,
			  database: DATABASE,
			  password: PASSWORD,
			  port: DBPORT,
			  ssl: true,
			  max: 15 // Maximum number of clients to create. Only 20 clients are allowed on heroku, so to avoid crashes I set it a lower value just to be safe.
			})
		}
		else if(process.env.USE_ENV && process.env.USE_ENV == "true")
		{
			console.log("Using connection url for config");
			this.pool = new Pool({
			  connectionString: process.env.DATABASE_URL,
			})
		}
	},
	query: async function(text, params, callback)
	{
		const start = Date.now();
		return this.pool.query(text, params, (err, res) =>
		{
			if(err)
			{
				console.log("Error during query:", {err});
				callback(err, res);
				return;
			}
			const duration = Date.now() - start;
			console.log("Executed query", {text, duration, rows : res.rowCount});
			if(callback)
				callback(err, res);
		});
	}
}