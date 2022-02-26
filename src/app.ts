import 'dotenv/config'
import express, {Request, Response} from 'express'

import Sender from "./sender"

const sender = new Sender()

const app = express()

const status = (req :Request, res :Response) => {
    return res.send({
        qr_code: sender.qrCode,
        connected: sender.isConnected,
    })
}
const send = async (req :Request, res :Response) => {
    let number :string
    let message :string
    if (req.method.toLowerCase() === 'get') {
        number = req.params.message
        message = req.params.message
    } else {
        number = req.body.message
        message = req.body.message
    }
    try {
        await sender.sendText(number, message)
        return res.status(200).json()
    } catch (error) {
        // https://youtu.be/uCoSzw9L0SQ?t=3159
        console.error(error)
        return res.status(500).json({status: "error", message: error})
    }
}
const list_menu = async (req :Request, res :Response) => {
    const {number, title, subtitle, description, button, list } = req.body
    try {
        const ret = await sender.sendListMenu(number, title, subtitle, description, button, list)
        return res.status(200).json({data: ret})
    } catch (error) {
        // https://youtu.be/uCoSzw9L0SQ?t=3159
        console.error(error)
        return res.status(500).json({status: "error", message: error})
    }
}

const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({extended: false}))

// ROUTES
app.get('/status', status)
app.get('/send', send)
app.post('/send', send)
app.post('/list_menu', list_menu)

app.listen(PORT, ()=> console.log('🤖⚡ server started, is running at PORT #', PORT))