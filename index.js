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
const loginRouter = require("./routes/login")
const logoutRouter = require("./routes/logout")
const applyRouter = require("./routes/apply")

const app = express()
app.set("view engine", "pug")
if (app.get("env") === "production") {
	app.set("trust proxy", 1)
	sessionConfig.cookie.secure = true
}
app.use("/assets", express.static("assets"))
app.use(session(sessionConfig))
app.use("/login", loginRouter)
app.use("/logout", logoutRouter)
app.use("/apply", applyRouter)

app.get('/', (req, res) => res.render("home", { user: req.session.user }))

app.get('/exports/:filename', (req, res) => {
	res.download(`var/exports/${req.params.filename}`, `cornice-${Date.now()}.jpg`)
})

app.listen(8000)