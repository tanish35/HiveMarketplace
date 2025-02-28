actions.createSSC = async (payload) => {
  const { carbonCreditNFT } = payload;

  if (!carbonCreditNFT) return;

  await api.db.createTable('settings');
  await api.db.createTable('purchases');

  let settings = {
    carbonCreditNFT,
    owner: api.sender
  };

  await api.db.insert('settings', settings);
};

actions.purchaseToken = async (payload) => {
  const { tokenId, price } = payload;
  const settings = await api.db.findOne('settings', {});
  const nftContract = settings.carbonCreditNFT;

  
  const amount = api.BigNumber(api.sender.balance).minus(api.BigNumber(api.sender.stake)).minus(api.BigNumber(api.sender.pendingUnstake));
  if (amount.lt(api.BigNumber(price))) {
    api.assert(false, 'Insufficient payment');
  }

  const credit = await api.executeSmartContract(nftContract, 'getCredit', { tokenId });
  if (api.BigNumber(credit.expiryDate).lt(api.BigNumber(api.timestamp))) {
    api.assert(false, 'Token expired');
  }

  const seller = await api.executeSmartContract(nftContract, 'ownerOf', { tokenId });
  if (!seller) {
    api.assert(false, 'Invalid seller');
  }

  await api.transferTokens(seller, 'SWAP.HIVE', price);

  await api.executeSmartContract(nftContract, 'transfer', { to: api.sender, tokenId });

  await api.db.insert('purchases', { tokenId, buyer: api.sender, seller, price, timestamp: api.timestamp });

  api.emit('nftPurchased', { tokenId, buyer: api.sender, seller, price });
};

actions.withdraw = async (payload) => {
  const { amount } = payload;
  const settings = await api.db.findOne('settings', {});

  if (api.sender !== settings.owner) {
    api.assert(false, 'Not the owner');
  }

  const balance = await api.getBalance(api.contractName, 'SWAP.HIVE');
  const withdrawAmount = amount ? api.BigNumber(amount).toFixed(8) : balance;

  if (api.BigNumber(withdrawAmount).gt(api.BigNumber(balance))) {
    api.assert(false, 'Insufficient balance');
  }

  await api.transferTokens(settings.owner, 'SWAP.HIVE', withdrawAmount);
};
