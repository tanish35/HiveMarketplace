actions.createSSC = async (payload) => {
  const { name, symbol } = payload;

  if (!name || !symbol) return;

  await api.db.createTable("nfts");
  await api.db.createTable("credits");
  await api.db.createTable("authorizedMinters");
  await api.db.createTable("tokenRates");

  let settings = {
    name,
    symbol,
    totalSupply: 0,
    tokenId: 0,
    defaultRate: "1000000000000000000",
    owner: api.sender,
  };

  await api.db.insert("settings", settings);
};

actions.mint = async (payload) => {
  const { to, typeofcredit, quantity, certificateURI, expiryDate, rate } =
    payload;
  const settings = await api.db.findOne("settings", {});

  if (
    api.sender !== settings.owner &&
    !(await api.db.findOne("authorizedMinters", { account: api.sender }))
  ) {
    api.assert(false, "Not authorized to mint");
  }

  const id = settings.tokenId;
  const credit = {
    id,
    typeofcredit,
    quantity,
    certificateURI,
    expiryDate,
    retired: false,
  };

  await api.db.insert("credits", credit);
  await api.db.insert("nfts", { id, account: to });

  settings.totalSupply += 1;
  settings.tokenId += 1;
  await api.db.update("settings", settings);

  const actualRate = rate || settings.defaultRate;
  await api.db.insert("tokenRates", { id, rate: actualRate });

  api.emit("creditMinted", {
    to,
    id,
    rate: actualRate,
    typeofcredit,
    quantity,
    certificateURI,
    expiryDate,
  });
};

actions.transfer = async (payload) => {
  const { to, tokenId } = payload;
  const nft = await api.db.findOne("nfts", { id: tokenId });

  api.assert(
    nft.account === api.sender,
    "You are not the owner of this credit"
  );

  nft.account = to;
  await api.db.update("nfts", nft);

  api.emit("creditTransferred", { from: api.sender, to, tokenId });
};

actions.retire = async (payload) => {
  const { tokenId } = payload;
  const nft = await api.db.findOne("nfts", { id: tokenId });
  const credit = await api.db.findOne("credits", { id: tokenId });
  const settings = await api.db.findOne("settings", {});

  api.assert(
    nft.account === api.sender,
    "You are not the owner of this credit"
  );
  api.assert(!credit.retired, "This credit is already retired");

  credit.retired = true;
  await api.db.update("credits", credit);

  settings.totalSupply -= 1;
  await api.db.update("settings", settings);

  await api.db.remove("nfts", nft);

  api.emit("creditRetired", { owner: api.sender, tokenId });
};

actions.addMinter = async (payload) => {
  const { minter } = payload;
  const settings = await api.db.findOne("settings", {});

  api.assert(api.sender === settings.owner, "Only the owner can add minters");
  api.assert(
    !(await api.db.findOne("authorizedMinters", { account: minter })),
    "Already a minter"
  );

  await api.db.insert("authorizedMinters", { account: minter });
};

actions.removeMinter = async (payload) => {
  const { minter } = payload;
  const settings = await api.db.findOne("settings", {});

  api.assert(
    api.sender === settings.owner,
    "Only the owner can remove minters"
  );
  const minterRecord = await api.db.findOne("authorizedMinters", {
    account: minter,
  });
  api.assert(minterRecord, "Not a minter");

  await api.db.remove("authorizedMinters", minterRecord);
};

actions.setRate = async (payload) => {
  const { tokenId, rate } = payload;
  const settings = await api.db.findOne("settings", {});

  api.assert(api.sender === settings.owner, "Only the owner can set rates");

  await api.db.update("tokenRates", { id: tokenId, rate });
};

actions.reduceQuantity = async (payload) => {
  const { tokenId, quantity } = payload;
  const nft = await api.db.findOne("nfts", { id: tokenId });
  const credit = await api.db.findOne("credits", { id: tokenId });

  api.assert(
    nft.account === api.sender,
    "You are not the owner of this credit"
  );
  api.assert(credit.quantity >= quantity, "Quantity is greater than available");

  credit.quantity -= quantity;
  await api.db.update("credits", credit);
};

actions.withdraw = async (payload) => {
  const { amount } = payload;
  const settings = await api.db.findOne("settings", {});

  api.assert(api.sender === settings.owner, "Only the owner can withdraw");

  const balance = await api.getBalance(api.contractName, "SWAP.HIVE");
  const withdrawAmount = amount ? api.BigNumber(amount).toFixed(8) : balance;

  if (api.BigNumber(withdrawAmount).gt(api.BigNumber(balance))) {
    api.assert(false, "Insufficient balance");
  }

  await api.transferTokens(settings.owner, "SWAP.HIVE", withdrawAmount);
};

actions.getCreditOwner = async (payload) => {
  const { tokenId } = payload;
  const nft = await api.db.findOne("nfts", { id: tokenId });
  return { owner: nft ? nft.account : null };
};

actions.getCredit = async (payload) => {
  const { tokenId } = payload;
  return await api.db.findOne("credits", { id: tokenId });
};

actions.getCreditByOwner = async (payload) => {
  const { owner } = payload;
  const nfts = await api.db.find("nfts", { account: owner });
  const creditIds = nfts.map((nft) => nft.id);
  return await api.db.find("credits", { id: { $in: creditIds } });
};

actions.getRate = async (payload) => {
  const { tokenId } = payload;
  const rate = await api.db.findOne("tokenRates", { id: tokenId });
  return { rate: rate ? rate.rate : null };
};
