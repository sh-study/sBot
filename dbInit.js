const Sequelize = require("sequelize");

const sequelize = new Sequelize("database", "root", process.env.password, {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: "database.sqlite"
});

const CurrencyShop = require("./models/CurrencyShop.js")(sequelize, Sequelize.DataTypes);
require("./models/Users.js")(sequelize, Sequelize.DataTypes);
require("./models/UserItems.js")(sequelize, Sequelize.DataTypes);

const force = process.argv.includes("--force") || process.argv.includes("-f");

sequelize.sync({ force }).then(async () => {
    const shop = [
        CurrencyShop.upsert({ name: "Tea", cost: 15 }),
        CurrencyShop.upsert({ name: "Cookie", cost: 30 }),
        CurrencyShop.upsert({ name: "Coffee", cost: 20 }),
        CurrencyShop.upsert({ name: "Cake", cost: 1000 }),
        CurrencyShop.upsert({ name: "Lemonade", cost: 500 })
    ];

    await Promise.all(shop);
    console.log("Database synced");

    sequelize.close();
}).catch(console.error);
