import { start } from 'repl'
import { create, Whatsapp, Message, SocketState } from 'venom-bot'

export type QRCode = {
    baseQR :string
    asciiQR :string
    attempts :number
}

class Sender {
    private client :Whatsapp
    private qr :QRCode
    private connected :boolean

    constructor() {
        this.initialize()
    }

    private initialize() {
        const qr = (baseQR :string, asciiQR :string, attempts :number) => {
            this.qr = {baseQR, asciiQR, attempts}
        }

        const status = (statusSession :string) => {
            this.connected = [
                'isLogged',
                'qrReadSuccess',
                'chatsAvailable',
            ].includes(statusSession)
        }

        const start = (client :Whatsapp) => {
            this.client = client
        }

        create('ws-sender', qr, status)
            .then((client) => start(client))
            .catch((error) => console.error(error))
    }

    async sendText(to :string, body :string) {
        // (12) 982041640
        // 5512982041640@c.us
        
        let chatId :string = to
        chatId = chatId.includes('@c.us')
            ? chatId
            : `${chatId}@c.us`
        chatId = chatId
            ?.replace('+', '')
        this.client.sendText(chatId, body)
    }
}

export default Sender