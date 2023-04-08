
// https://t.me/WBTtokenBot
const { Telegraf, session, Markup } = require('telegraf')
const { ethers } = require("ethers");
let fs = require('fs')
var testErc20Token = JSON.parse(
    fs.readFileSync(__dirname + '/tokenabi.json', 'utf8')
)
let wallets = []
let ERC20_MINT_AMOUNT = '500'

const token = 'Секрет'
if (token === undefined) {
    throw new Error('BOT_TOKEN must be provided!')
}
//Bot setup
const bot = new Telegraf(token)
bot.use(session())



bot.command('start', async (ctx) => {
    try {
        const keyboard = Markup.inlineKeyboard([
            Markup.button.callback("Хочу аірдроп", "drop"),
            Markup.button.callback("Не хочу дроп", "delete"),
        ]);
        ctx.reply('Ласкаво просимо у тестового Аір Дроп бота токенів ТТ у тестовій мережі вайтбіт', keyboard)

    } catch (e) {
        console.log(e)
    }
})
bot.action("delete", ctx => ctx.deleteMessage());
bot.action("drop", ctx => ctx.reply('Надішлі мені адрессу свого гаманцю у мережі WB'));
bot.on('text', async (ctx) => {
    if (ethers.utils.isAddress(ctx.message.text)) {
        console.log(wallets.includes(ctx.message.text))
        if (!wallets.includes(ctx.message.text)) {
            const provider = new ethers.providers.StaticJsonRpcProvider('https://rpc-testnet.whitebit.network/');
            let gas_price = provider.getGasPrice() // gasPrice
            const wallet = ethers.Wallet.fromMnemonic('Секрет', `m/44'/60'/0'/0/0`);
            let walletSigner = wallet.connect(provider)
            const testERC20 = new ethers.Contract("0xe4Ea567383f0c7375B94Dbe7D64bb5e383Cc3a9F", testErc20Token.abi, walletSigner)
            console.log(`MINTING ${ERC20_MINT_AMOUNT} FOR ${ctx.message.text}`)
            await testERC20.mint(
                ctx.message.text,
                ethers.utils.parseUnits(ERC20_MINT_AMOUNT, 18),
                {
                    gasLimit: 100000,
                    gasPrice: gas_price,
                }
            )
            ctx.reply('Токени вже у вас на гаманці)')
            wallets.push(ctx.message.text)
        } else {
            ctx.reply('На цей гаманець вже видано дроп, наступний раз через декілька годин')
        }
    } else {
        ctx.reply('Не певен що це адрес гаманцю перевір данні')
    }
})

bot.launch()
