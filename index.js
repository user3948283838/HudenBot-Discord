const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const express = require('express');

// --- ВЕБ-СЕРВЕР ДЛЯ RENDER (чтобы не засыпал) ---
const app = express();
app.get('/', (req, res) => res.send('HudenBot работает! 🛡️'));
app.listen(process.env.PORT || 3000, () => {
    console.log('Веб-сервер запущен');
});

// --- НАСТРОЙКИ БОТА ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

client.on('ready', () => {
    console.log(`HudenBot готов! Вошел как ${client.user.tag}`);
});

// --- ОБРАБОТКА КОМАНД ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- БЕЗОПАСНАЯ ПРОВЕРКА ПРАВ ---
    if (message.guild) {
        // Если на сервере — проверяем права администратора
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('У тебя нет прав для этой команды! ⛔');
        }
    } else {
        // Если в личке — разрешаем только "привет" и выходим из функции
        if (command === 'привет') {
            return message.reply('Привет! Я HudenBot. 🛡️ В личке я просто здороваюсь, а на серверах умею кикать и банить!');
        } else {
            return message.reply('В личке я выполняю только команду !привет. Добавь меня на сервер для полной модерации!');
        }
    }

    // --- КОМАНДЫ ДЛЯ СЕРВЕРА ---
    
    // 1. ПРИВЕТ
    if (command === 'привет') {
        message.reply('Привет! HudenBot на связи. 🛡️');
    }

    // 2. КИК
    if (command === 'кик') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('Укажи пользователя: !кик @юзер');
        if (!member.kickable) return message.reply('Я не могу кикнуть этого пользователя.');
        
        const reason = args.slice(1).join(' ') || 'Без причины';
        await member.kick(reason);
        message.reply(`👢 ${member.user.tag} кикнут. Причина: ${reason}`);
    }

    // 3. БАН
    if (command === 'бан') {
        const member = message.mentions.members.first();
        if (!member) return message.reply('Укажи пользователя: !бан @юзер');
        if (!member.bannable) return message.reply('Я не могу забанить этого пользователя.');
        
        const reason = args.slice(1).join(' ') || 'Без причины';
        await member.ban({ reason });
        message.reply(`🔨 ${member.user.tag} забанен. Причина: ${reason}`);
    }

    // 4. ОЧИСТКА (УДАЛЕНИЕ СООБЩЕНИЙ)
    if (command === 'очистить') {
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('Укажи число от 1 до 100: !очистить 10');
        }
        await message.channel.bulkDelete(amount + 1, true);
        message.channel.send(`🧹 Удалено ${amount} сообщений.`).then(msg => {
            setTimeout(() => msg.delete(), 3000);
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
