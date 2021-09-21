const express = require("express")

const { users } = require("../auth.json")

const router = express.Router()
router.use(express.urlencoded({ extended: true }))

router.get("/", (req, res) => req.session.user ? res.redirect("/") : res.render("login"))
router.post("/", (req, res) => {
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

module.exports = router