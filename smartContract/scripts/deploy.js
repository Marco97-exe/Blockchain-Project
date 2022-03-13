const main = async () => {
  const Prenotation = await hre.ethers.getContractFactory("Prenotation");
  const prenotation = await Prenotation.deploy();

  await prenotation.deployed();

  console.log("Prenotation deployed to:", prenotation.address);
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

runMain();
