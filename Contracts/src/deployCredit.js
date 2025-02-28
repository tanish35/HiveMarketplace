const { Hive } = require("@splinterlands/hive-interface");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const hive = new Hive();

async function deployCreditContract() {
  const privateKey = process.env.PRIVATE_KEY;
  const account = "tanish34";

  const contractCode = fs.readFileSync("./CarbonCreditNFT.js", "utf8");
  const base64EncodedCode = Buffer.from(contractCode).toString("base64");

  const contractPayload = {
    contractName: "contract",
    contractAction: "deploy",
    contractPayload: {
      name: "carbon_credit_nft",
      code: base64EncodedCode,
    },
  };

  try {
    const result = await hive.customJson(
      "ssc-mainnet-hive",
      contractPayload,
      account,
      privateKey,
      true,
      300,
      5
    );

    console.log("CarbonCreditNFT Contract deployed successfully:", result);

    const initResult = await hive.customJson(
      "ssc-mainnet-hive",
      {
        contractName: "carbon_credit_nft",
        contractAction: "createSSC",
        contractPayload: {
          name: "CarbonCreditsNFT",
          symbol: "CCNFT",
        },
      },
      account,
      privateKey,
      true,
      300,
      5
    );

    console.log("CarbonCreditNFT Contract initialized:", initResult);
  } catch (error) {
    console.error("Error deploying CarbonCreditNFT contract:", error);
  }
}

deployCreditContract();

//Deployment Transaction Id: dff05de36ff80858aee3cbfae6fe34d3a69e5048
//Initialized Transaction Id: 167a5c005a784de021a579da70ed3a0a480485ff
