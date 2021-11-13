const express = require("express")

const { users } = require("../auth.json")

const router = express.Router()
router.use(express.urlencoded({ extended: true }))

router.get("/login", (req, res) => req.session.user ? res.redirect("/login") : res.render("login"))
router.post("/login", (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.sendStatus(401)
        return
    }

    if (!users[req.body.username]) {
        res.sendStatus(404)
        return
    }

    if (users[req.body.username].password !== req.body.password) {
        res.sendStatus(403)
        return
    }

    req.session.user = users[req.body.username]
    res.redirect("/")
})
router.get("/logout", (req, res) => {
    req.session.destroy()
    res.redirect("/")
})

module.exports = router