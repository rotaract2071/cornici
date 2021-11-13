const express = require('express')
const session = require("express-session")

const { secret } = require("./auth.json")
const sessionConfig = {
	secret: secret,
	saveUninitialized: false,
	resave: false,
	cookie: {
		httpOnly: true,
		sameSite: "strict"
	}
}
const authRouter = require("./routes/auth")

const app = express()
app.set("view engine", "pug")
if (app.get("env") === "production") {
	app.set("trust proxy", 1)
	sessionConfig.cookie.secure = true
}
app.use("/assets", express.static("assets"))
app.use(session(sessionConfig))
app.use("/", authRouter)

app.get('/', (req, res) => res.render("home", { user: req.session.user }))

app.listen(8000)