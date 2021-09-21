const express = require("express")
const multer = require("multer")
const { nanoid } = require("nanoid")
const sharp = require("sharp")
const fs = require("fs/promises")

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/', upload.single('image'), async (req, res) => {
    const zone = req.body.zone
    const ratio = req.body.ratio
    const [top, left] = [Math.floor(req.body.top), Math.floor(req.body.left)]
    const [width, height] = [Math.floor(req.body.width), Math.floor(req.body.height)]

    const fileName = `${nanoid()}.jpg`

    await sharp(req.file.buffer)
        .rotate()
        .extract({
            top: top >= 0 ? top : 0,
            left: left >= 0 ? left : 0,
            width: width,
            height: height
        })
        .resize(1080, 1080, { fit: 'outside' })
        .composite([{ input: `assets/frames/${zone}_${ratio}.png` }])
        .jpeg({ quality: 100 })
        .toFile(`var/exports/${fileName}`)
        .catch(err => console.error(err))

    console.log(`${(new Date).toLocaleString('it-IT')}: ${req.ip} overlapped the ${ratio} frame "${zone}" to a ${width} x ${height} image`)
    setTimeout(() => fs.unlink(`var/exports/${fileName}`).catch(err => console.error(err)), 10 * 1000)

    res.json({ filename: `/exports/${fileName}` })
})

module.exports = router