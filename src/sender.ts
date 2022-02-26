import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'
import { create, Whatsapp, Message, SocketState } from 'venom-bot'

export type QRCode = {
    baseQR :string
    asciiQR :string
    attempts :number
}

export type MenuItem = {
    title :string
    description :string
}

export type ListMenu = {
    title: string
    rows: MenuItem[]
}

class Sender {
    private client :Whatsapp
    private qr :QRCode
    private connected :boolean

    constructor() {
        this.initialize()
    }

    get qrCode() :QRCode {
        return this.qr
    }

    get isConnected() :boolean {
        return this.connected
    }    

    private initialize() {
        const qr = (baseQR :string, asciiQR :string, attempts :number) => {
            this.qr = {baseQR, asciiQR, attempts}
        }

        const statusFind = (statusSession :string, status :string) => {
            this.connected = [
                'isLogged',
                'qrReadSuccess',
                'chatsAvailable',
            ].includes(statusSession)
            console.log('Status', status)
        }

        const start = (client :Whatsapp) => {
            this.client = client

            client.onStateChange((state) => {
                this.connected = state === SocketState.CONNECTED
            })
        }

        create('ws-sender', qr, statusFind)
            .then((client) => start(client))
            .catch((error) => console.error(error))
    }

    private chatId(to :string) {
        // (12) 982041640
        // 5512982041640@c.us

        if (! isValidPhoneNumber(to, 'BR')) {
            throw new Error('Invalid phone number')
        }

        let chatId :string = parsePhoneNumber(to, 'BR')
            .format('E.164')
            .replace('+', '')

        chatId = chatId.includes('@c.us')
            ? chatId
            : `${chatId}@c.us`
        
        return chatId
    }

    async sendText(to :string, body :string) {
        try {
            await this.client.sendText(this.chatId(to), body)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async sendListMenu(to :string, title :string, subTitle :string, description :string, button :string, list :ListMenu) {
        await this.client.sendListMenu(this.chatId(to), title, subTitle, description, button, list as any)
            .then((result) => {
                return result
            })
            .catch((error) => {
                return `Error when sending: ${error}`
            })
    }
}

export default Sender