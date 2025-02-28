const { Hive } = require("@splinterlands/hive-interface");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const hive = new Hive();

async function initializeMarketplaceContract() {
  const privateKey = process.env.PRIVATE_KEY;
  const account = "tanish34";

  const carbonCreditNFTContractName = "carbon_credit_nft";

  const initPayload = {
    contractName: "marketplace_contract",
    contractAction: "createSSC",
    contractPayload: {
      carbonCreditNFT: carbonCreditNFTContractName,
    },
  };

  try {
    const result = await hive.customJson(
      "ssc-mainnet-hive",
      initPayload,
      account,
      privateKey,
      true,
      600,
      100
    );

    console.log("Marketplace contract initialized successfully:", result);
  } catch (error) {
    console.error("Error initializing marketplace contract:", error);
  }
}

initializeMarketplaceContract();

//Initialization id: ae224ddb2b90a5220ccb1ccb3178a1adaa802807
