const BoilerPlate = require('./boiler-plate');

const run = async () => {
  const plate = new BoilerPlate(__dirname + "/data/transactions.csv");
  await plate.run()
  console.log(plate.data)
}
run()