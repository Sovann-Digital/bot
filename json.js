const { google } = require('googleapis');

// Set up Google Sheets API credentials
const credentials = require('./data/data.json'); // Replace with the actual path
const client = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

// Google Sheet ID and range
const sheetId = '2PACX-1vTdByEyxHASHguLrnGj7yWT-yOR_Pf1tDMHlk3K0UBIarnhhWRgWymOk0J5PKILSAn-ZLXUajUEGQTy'||'1eBGbP_N4ezCOdB4ecZYtVWt13gaEtke2VL_A7GXHoiA';
const sheetRange = 'A1:I'; // Adjust the range as needed

// Fetch data from the Google Sheet
async function fetchData() {
  try {
    const sheets = google.sheets({ version: 'v4', auth: client });
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: sheetRange });
    return response.data.values;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
}

// Convert data to JSON format
function convertToJSON(data) {
  // Assuming the header row is included in the data (as per your sheet range)
  const [headerRow, ...rows] = data;

  // Assuming the header row contains these column names
  const [dateHeader, communeHeader, villageHeader, serviceHeader, phoneHeader, addressHeader, latitudeHeader, longitudeHeader, telegramHeader] = headerRow;

  const jsonData = [];

  rows.forEach(row => {
    const [date, commune, village, service, phone, address, latitude, longitude, telegram] = row;

    // Create a JSON structure based on your needs
    jsonData.push({
      Date: date,
      Communes: [
        {
          name: commune,
          villages: [
            {
              name: village,
              Services: [
                {
                  name: service,
                  phone: {
                    hotline: phone,
                    telegram: telegram,
                  },
                  location: {
                    address: address,
                    latitude: latitude,
                    longitude: longitude,
                  },
                }
              ],
            },
          ],
        },
      ],
    });
  });

  return jsonData;
}

// Main function to fetch data, convert to JSON, and log the result
async function main() {
  try {
    const data = await fetchData();
    const jsonData = convertToJSON(data);
    console.log(JSON.stringify(jsonData, null, 2));
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

main();
