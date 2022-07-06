const { createReadStream } = require("fs");
const csv = require("csv-parser");
const axios = require("axios");
module.exports = class BoilerPlate {
  constructor(filePath, options = "utf-8") {
    this.stream = createReadStream(filePath, options);
    this.data = {};
  }
  handleData() {
    return new Promise((resolve, reject) => {
      this.stream
        .pipe(csv())
        .on("data", (row) => {
          const timestamp = parseInt(row["timestamp"]);
          const transactionType = row["transaction_type"];
          const token = row["token"];
          const amount = parseFloat(row["amount"]);
          if (this.data[token] === undefined) {
            this.data[token] = {
              amount: 0,
              // timestamp: 0,
            };
          }
          // this.data[token].timestamp = timestamp;
          if (transactionType === "DEPOSIT") {
            this.data[token].amount += amount;
          } else {
            this.data[token].amount -= amount;
          }
        })
        .on("end", () => {
          resolve(this.data);
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }
  async fetchRate(fsym, tsyms = "USD") {
    const response = await axios.get(
      `https://min-api.cryptocompare.com/data/price?tsyms=${tsyms}&fsym=${fsym}`
    );
    return response.data[tsyms];
  }
  async run() {
    await this.handleData();
    const tokens = Object.keys(this.data);
    for (const token of tokens) {
      const rate = await this.fetchRate(token);
      this.data[token].amountInUSD = this.data[token].amount * rate;
    }
  }
};
