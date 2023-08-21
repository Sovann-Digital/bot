const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('6307148351:AAEerLWT4UWMWJZMt5d0X4NigbYewGr0wEk');
const DATA_URL = 'https://sovann-digital.github.io/sdau-data/data/data-sdau.json';
const PHOTO_URL = 'https://imgs.search.brave.com/1ceNxYMVBSYwbGpdRw2Es-AyucQw-FP8o2ciL7ep7CY/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNjE1/NTgyNDAyL3Bob3Rv/L21lZXJrYXQtY2F0/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz1haEVRaEp5aVdO/Yk1VdUdscWZsbktr/dXpyRU5iM0h4UTZi/NU9Hc29PRkxJPQ';


bot.start(async (ctx) => {
    try {
        await ctx.replyWithPhoto({ url: PHOTO_URL }, { caption: '👇សូមជ្រើសរើសឃុំរបស់អ្នកក្នុងស្រុករតនមណ្ឌល' });

        const jsonData = await axios.get(DATA_URL);
        const communes = jsonData.data[0]?.Communes;

        if (communes) {
            const buttons = communes.map(commune => Markup.button.callback(commune.name+" (🏘)", `commune_${commune.name}`));
            const keyboard = Markup.inlineKeyboard(buttons, { columns: 2 });

            await ctx.reply('សូមជ្រើសរើសឃុំរបស់អ្នក:', keyboard);
        } else {
            console.log("Commune data not found.");
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

bot.action('back_to_commune', async (ctx) => {
    ctx.deleteMessage();
    try {
        const jsonData = await axios.get(DATA_URL);
        const communes = jsonData.data[0]?.Communes;

        if (communes) {
            const buttons = communes.map(commune => Markup.button.callback(commune.name + " (🏘)", `commune_${commune.name}`));
            const keyboard = Markup.inlineKeyboard(buttons, { columns: 3 });

            await ctx.reply('សូមជ្រើសរើសឃុំរបស់អ្នក:', keyboard);
        } else {
            console.log("Commune data not found.");
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

bot.action(/commune_(.+)/, async (ctx) => {
    ctx.deleteMessage();
    try {
        const selectedCommuneName = ctx.match[1];
        const jsonData = await axios.get(DATA_URL);
        const selectedCommune = jsonData.data[0]?.Communes.find(commune => commune.name === selectedCommuneName);

        if (selectedCommune) {
            const villageButtons = selectedCommune.villages.map(village => Markup.button.callback("(🏠) " + village.name, `village_${village.command}`));
            
            const backToCommuneButton = Markup.button.callback('⬅️ Back', 'back_to_commune');
            villageButtons.push(backToCommuneButton); // Adding the back button to the villageButtons array
            
            const villageKeyboard = Markup.inlineKeyboard(villageButtons, { columns: 2 });
            
            await ctx.reply(`សូមជ្រើសរើសភូមិរបស់អ្នកដែលមានក្នុង ${selectedCommune.name} :`, villageKeyboard);
        } else {
            console.log("Selected commune not found.");
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


bot.action(/village_(.+)/, async (ctx) => {
    try {
        const villageCommand = ctx.match[1];
        const jsonData = await axios.get(DATA_URL);
        const communes = jsonData.data[0]?.Communes;

        if (communes) {
            const selectedVillage = communes.flatMap(commune => commune.villages).find(village => village.command === villageCommand);

            if (selectedVillage) {
                const services = selectedVillage.Services;
                const servicesText = services.map(service => `• ${service.name}`).join('\n');
                
                // Create inline buttons for each service
                const inlineButtons = services.map(service => Markup.button.callback(service.name, `service_${service.command}_${selectedVillage.name}`));
                const inlineKeyboard = Markup.inlineKeyboard(inlineButtons, { columns: 1 });

                const message = `🗺 សេវាកម្មដែលអាចផ្ដល់ជូន ${selectedVillage.name}:\n\n${servicesText}\n\n⚠សូមទំនាក់ទំនងដោយមានការ⚠`;
                await ctx.replyWithHTML(message, inlineKeyboard);
            } else {
                console.log("Selected village not found.");
            }
        } else {
            console.log("Commune data not found.");
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

bot.action(/service_(.+)_(.+)/, async (ctx) => {
    try {
        const serviceCommand = ctx.match[1];
        const villageName = ctx.match[2];
        
        // Load JSON data
        const response = await axios.get(DATA_URL);
        const jsonData = response.data;
        
        const communes = jsonData[0]?.Communes;

        if (communes) {
            const selectedVillage = communes
                .flatMap(commune => commune.villages)
                .find(village => village.name === villageName);

            if (selectedVillage) {
                const selectedService = selectedVillage.Services
                    .find(service => service.command === serviceCommand);

                if (selectedService) {
                    const { location, name: serviceName, phone, posterurl } = selectedService;

                    // ... (remaining code)

                    const message = `
                        👮‍♂️កន្លែង ${serviceName} ដែលនៅជិតជាងគេនៅទីតាំង ${villageName}👮‍♂️:
                        \n${address} 
                        \nលេខទូរស័ព្ទទាន់ហេតុការណ៍:
                        ${formattedPhoneNumbers}
                        \nTelegram: ${phone.telegram}
                        \n${locationText}
                    `;
                    // await ctx.replyWithHTML(message);
                    
                    // Send the poster image
                    if (posterurl) {
                        await ctx.replyWithPhoto({ source: posterurl , captioin: message});
                    }

                    await ctx.replyWithHTML("ព័ត៌មានបន្ថែមពីយើងខ្ញុំ: <a href='https://t.me/sdaudigital'>Link</a>")
                } else {
                    console.log("Selected service not found.");
                }
            } else {
                console.log("Selected village not found.");
            }
        } else {
            console.log("Commune data not found.");
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


bot.settings((ctx) => {
    ctx.reply("Bot setting of command");
});

bot.launch();
