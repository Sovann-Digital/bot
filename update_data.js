const fs = require("fs");
const server_df = "./data_server.json";
let new_server_data; // Replace with the new value you want

// Read users.json file
fs.readFile(server_df, function (err, data) {
    if (err) throw err;

    // Converting to JSON
    const users = JSON.parse(data);
    new_server_data=users[0].data["amount"] + 1;

    console.log(users[0].data["amount"]); // Print the current value of "amount"

    // Update the "amount" property with the new value
    users[0].data["amount"] = new_server_data;

    // Write the updated data back to the file
    fs.writeFile(server_df, JSON.stringify(users), (err) => {
        if (err) throw err;
        console.log("Done writing"); // Success
    });
});
