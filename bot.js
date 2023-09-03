const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('6307148351:AAEerLWT4UWMWJZMt5d0X4NigbYewGr0wEk');
const DATA_URL = 'https://sovann-digital.github.io/sdau-data/data/data-sdau.json';
const PHOTO_URL = 'https://sovann-digital.github.io/sdau-data/images/poster-start.png';


bot.start(async (ctx) => {
    try {
        await ctx.replyWithPhoto({ url: PHOTO_URL }, { caption: '👇សូមជ្រើសរើសឃុំរបស់អ្នកក្នុងស្រុករតនមណ្ឌល' });

        const jsonData = await axios.get(DATA_URL);
        const communes = jsonData.data[0]?.Communes;

        if (communes) {
            const buttons = communes.map(commune => Markup.button.callback("(🏘)"+commune.name, `commune_${commune.name}`));
            const keyboard = Markup.inlineKeyboard(buttons, { columns: 2 });

            await ctx.reply('(🗺)សូមជ្រើសរើសឃុំរបស់អ្នក:', keyboard);
        } else {
            console.log("Commune data not found.");
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

bot.action(/commune_(.+)/, async (ctx) => {
    try {
        const selectedCommuneName = ctx.match[1];
        const jsonData = await axios.get(DATA_URL);
        const selectedCommune = jsonData.data[0]?.Communes.find(commune => commune.name === selectedCommuneName);

        if (selectedCommune) {
            // Check if the commune has villages
            if (selectedCommune.villages && selectedCommune.villages.length > 0) {
                const villageButtons = selectedCommune.villages.map(village => Markup.button.callback("(🏠)" + village.name, `village_${village.command}`));
                const villageKeyboard = Markup.inlineKeyboard(villageButtons, { columns: 2 });

                await ctx.reply(`(🗺)សូមជ្រើសរើសភូមិរបស់អ្នកដែលមានក្នុង ${selectedCommune.name} :`, villageKeyboard);
            } else {
                // Send a message indicating there is no data for villages in this commune
                await ctx.reply(`មិនមានទិន្នន័យសម្រាប់ឃុំនេះនៅឡើយ។`);
            }
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
                const servicesText = services.map(service => `(${service.name})`).join('\n');
                
                const inlineButtons = services.map(service => Markup.button.callback(service.name, `service_${service.command}_${selectedVillage.name}`));
                
                // Add two additional buttons for "ប៉ូលីសចរាចរណ៍" and "ប៉ូលីសសង្គ្រោះបន្ទាន់"
                const additionalButtons = [
                    Markup.button.callback("ប៉ូលីសចរាចរណ៍", "additional_service_1"),
                    Markup.button.callback("ប៉ូលីសសង្គ្រោះបន្ទាន់", "additional_service_2"),
                ];

                const cancelButton = Markup.button.callback('មិនយក ❌', 'cancel'); // Add the cancel button
                const inlineKeyboard = Markup.inlineKeyboard([...inlineButtons, ...additionalButtons, cancelButton], { columns: 1 }); // Include the additional buttons and cancel button

                await ctx.reply(`សេវាកម្មដែលអាចផ្ដល់ជូន ${selectedVillage.name}:\n${servicesText}`, inlineKeyboard);
            } else {
                await ctx.reply(`មិនមានទិន្នន័យសម្រាប់ភូមិនេះនៅឡើយ។`);
                console.log("Selected village not found.");
            }
        } else {
            console.log("Commune data not found.");
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Handle the cancel button action
bot.action('cancel', async (ctx) => {
    await ctx.deleteMessage();
});

bot.help((ctx) => {
    const apology = `សូមទោស អត់មានទូរស័ព្ទទំនាក់ទំនងទេ។ មិនអាចធ្វើការហៅទូរស័ព្ទបានទេ។`;
    ctx.reply(apology);
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
                    const { location, name: serviceName, phone, posterurl } = selectedService;  // Extract posterurl here

                    if (location && typeof location === 'object') {
                        const { latitude, longitude, address, telegram } = location;

                        let formattedPhoneNumbers = '';
                        if (phone && phone.hotline) {
                            formattedPhoneNumbers = Object.entries(phone.hotline)
                                .filter(([provider, number]) => number)
                                .map(([provider, number]) => `\n| - ${provider}: ${number}`)
                                .join('');
                        } else {
                            formattedPhoneNumbers = 'មិនមានប្រព័ន្ធលេខទូរស័ព្ទសម្រាប់ទាក់ទង';
                        }

                        const locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;
                        const locationText = `ទីតាំងកន្លែងផ្ដល់សេវា: <a href="${locationLink}">View on Map</a>`;

                        if (posterurl) {
                            try {
                                const caption = `
                                    <b>${serviceName}</b>
                                    \n<i>${address}</i>
                                    \n<b>លេខទូរស័ព្ទទាន់ហេតុការណ៍:</b>${formattedPhoneNumbers}
                                    \n<b>Telegram:</b> ${phone.telegram}
                                    \n${locationText}
                                `;
                                await ctx.replyWithPhoto({ url: posterurl }, { caption, parse_mode: 'HTML' }); // Send the poster image with caption
                            } catch (error) {
                                console.error('Error sending poster photo:', error);
                            }
                        }                        
                        await ctx.replyWithHTML("ព័ត៌មានបន្ថែមពីយើងខ្ញុំ: <a href='https://t.me/sdaudigital'>Link</a>")
                    } else {
                        console.log("Service location data is missing or not in the expected format.");
                    }
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

bot.launch();
