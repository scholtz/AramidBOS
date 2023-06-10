initState({
  ipfsHash: null,
  config: null,
  chainFromId: 101001,
  chainToId: 101001,
  tokenFromId: 37074699,
  tokenToId: 76238324,
  addressTo: 'TESTNTTTJDHIF5PJZUBTTDYYSKLCLM6KXCTWIOOTZJX5HO7263DPPMM2SU',
  addressFrom: 'TESTNTTTJDHIF5PJZUBTTDYYSKLCLM6KXCTWIOOTZJX5HO7263DPPMM2SU',
  amount: 0,
  amountUint: 0,
  feeAmount: 0,
  destinationAmount,
  amountFormatted: '',
  feeAmountFormatted: '',
  destinationAmountFormatted: '',
  reciever,
  inSetup: true,
  inReview: false,
  inPayment: false,
  inClaim: false,
});

const CONFIG_SENDER = 'OUXAY6ZUAQFRRN3UI2RIQYUOPPJWGTNGUEG6X6CH672ETLRJN3SYZ7RBDQ';
const CONFIG_ASSET_ID = '106';
const CONFIG_AMOUNT = '102';
const CONFIG_URL = 'https://indexer.aramidmain.a-wallet.net/v2/accounts/OUXAY6ZUAQFRRN3UI2RIQYUOPPJWGTNGUEG6X6CH672ETLRJN3SYZ7RBDQ/transactions?limit=1000';
const IPFS_HOST = 'https://cloudflare-ipfs.com/ipfs/';
const ENV = 'testnet';

const donate = () => {
  Near.call(state.reciever, 'donate', {}, '30000000000000', state.amount * 1e24);
};
const onChangeChainFrom = chainId => {
  let nextChainToId = '';
  let nextTokenFromId = '';
  let nextTokenToId = '';
  if (Object.keys(state.config.chains2tokens[chainId]).length == 1) {
    nextChainToId = Object.keys(state.config.chains2tokens[chainId])[0];
  }
  if (nextChainToId != '' && Object.keys(state.config.chains2tokens[chainId][nextChainToId]).length == 1) {
    nextTokenFromId = Object.keys(state.config.chains2tokens[chainId][nextChainToId])[0];
  }
  if (nextTokenFromId != '' && Object.keys(state.config.chains2tokens[chainId][nextChainToId][nextTokenFromId]).length == 1) {
    nextTokenToId = Object.keys(state.config.chains2tokens[chainId][nextChainToId][nextTokenFromId])[0];
  }

  State.update({
    chainFromId: chainId,
    chainToId: nextChainToId,
    tokenFromId: nextTokenFromId,
    tokenToId: nextTokenToId,
  });
};

const onChangeChainTo = chainId => {
  let nextTokenFromId = '';
  let nextTokenToId = '';
  if (Object.keys(state.config.chains2tokens[state.chainFromId][chainId]).length == 1) {
    nextTokenFromId = Object.keys(state.config.chains2tokens[state.chainFromId][chainId])[0];
  }
  if (nextTokenFromId != '' && Object.keys(state.config.chains2tokens[state.chainFromId][chainId][nextTokenFromId]).length == 1) {
    nextTokenToId = Object.keys(state.config.chains2tokens[state.chainFromId][chainId][nextTokenFromId])[0];
  }

  State.update({
    chainToId: chainId,
    tokenFromId: nextTokenFromId,
    tokenToId: nextTokenToId,
  });
};
const onChangeTokenFrom = tokenId => {
  let nextTokenToId = '';
  console.log('state.config.chains2tokens[state.chainFromId][state.chainToId][tokenId]', state.config.chains2tokens[state.chainFromId][state.chainToId][tokenId]);
  if (Object.keys(state.config.chains2tokens[state.chainFromId][state.chainToId][tokenId]).length == 1) {
    nextTokenToId = Object.keys(state.config.chains2tokens[state.chainFromId][state.chainToId][tokenId])[0];
  }

  State.update({
    tokenFromId: tokenId,
    tokenToId: nextTokenToId,
  });
  console.log('onChangeTokenFrom.state', state);
};
const onChangeTokenTo = tokenId => {
  State.update({
    tokenToId: tokenId,
  });
};

const onChangeAddressFrom = address => {
  State.update({
    addressFrom: address,
  });
};
const onChangeAddressTo = address => {
  State.update({
    addressTo: address,
  });
};

const onChangeAmount = amount => {
  try {
    console.log('onChangeAmount', amount);
    const bigAmount = Big(amount);
    console.log('bigAmount', bigAmount);
    const amountUint = bigAmount.times(Big(10).pow(state.config.chains2tokens[state.chainFromId][state.chainToId][state.tokenFromId][state.tokenToId].sourceDecimals)).toFixed(0);
    console.log('amountUint', amountUint);

    const feeConfig = state.config.chains2tokens[state.chainFromId][state.chainToId][state.tokenFromId][state.tokenToId].feeAlternatives.find(f => f.minimumAmount <= Big(amountUint).toNumber());

    console.log('feeConfig', feeConfig, state.config.chains2tokens[state.chainFromId][state.chainToId][state.tokenFromId][state.tokenToId].feeAlternatives);
    const fee = Big(amountUint).times(Big(feeConfig.sourcePercent)).toFixed(0);
    console.log('fee', fee);
    const destinationAmount = Big(amountUint)
      .minus(fee)
      .times(Big(10).pow(state.config.chains2tokens[state.chainFromId][state.chainToId][state.tokenFromId][state.tokenToId].destinationDecimals))
      .div(Big(10).pow(state.config.chains2tokens[state.chainFromId][state.chainToId][state.tokenFromId][state.tokenToId].sourceDecimals))
      .toFixed(0);

    console.log('destinationAmount', destinationAmount);

    State.update({
      amount: amount,
      amountUint: amountUint,
      feeAmount: fee,
      destinationAmount: destinationAmount,
      amountFormatted: Big(amountUint)
        .div(Big(10).pow(state.config.chains2tokens[state.chainFromId][state.chainToId][state.tokenFromId][state.tokenToId].sourceDecimals))
        .toFixed(state.config.chains2tokens[state.chainFromId][state.chainToId][state.tokenFromId][state.tokenToId].sourceDecimals),
      feeAmountFormatted: Big(fee)
        .div(Big(10).pow(state.config.chains2tokens[state.chainFromId][state.chainToId][state.tokenFromId][state.tokenToId].sourceDecimals))
        .toFixed(state.config.chains2tokens[state.chainFromId][state.chainToId][state.tokenFromId][state.tokenToId].sourceDecimals),
      destinationAmountFormatted: Big(destinationAmount)
        .div(Big(10).pow(state.config.chains2tokens[state.chainFromId][state.chainToId][state.tokenFromId][state.tokenToId].destinationDecimals))
        .toFixed(state.config.chains2tokens[state.chainFromId][state.chainToId][state.tokenFromId][state.tokenToId].destinationDecimals),
    });
  } catch (e) {
    console.log(e);
  }
};

const onClickReview = () => {
  State.update({
    inSetup: false,
    inReview: true,
    inClaim: false,
    inPayment: false,
  });
};

const onClickBridge = () => {
  State.update({
    inSetup: false,
    inReview: false,
    inClaim: false,
  });
};

const onClickReviewBack = () => {
  State.update({
    inSetup: true,
    inReview: false,
    inClaim: false,
  });
};
const fetchConfiguration = () => {
  return asyncFetch(CONFIG_URL, {
    headers: {
      'X-Indexer-Api-Token': `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`,
    },
    method: 'GET',
  });
};
const fetchIPFSConfiguration = () => {
  const url = IPFS_HOST + state.ipfsHash;
  return asyncFetch(url);
};

const getConfig = () => {
  fetchConfiguration().then(r => {
    const latestTx = r.body.transactions.find(tx => tx.sender == CONFIG_SENDER);
    console.log('latestTx', latestTx);

    const note = JSON.parse(Buffer.from(latestTx.note, 'base64').toString().replace('aramid-config/v1:j', ''));
    State.update({
      ipfsHash: note.ipfsHash,
    });
    //state.ipfsHash = note.ipfsHash;
    console.log('state', state);
    loadIPFSConfig();
  });
  console.log('config', config);
  return true;
};
const loadIPFSConfig = () => {
  console.log('loadIPFSConfig');
  if (!state.ipfsHash) return;
  fetchIPFSConfiguration().then(r => {
    State.update({
      config: r.body,
    });
    console.log('ipfs data state', state);
  });
};

const submitNearTx = async () => {
  if (state.tokenFromId !== '0x0000000000000000000000000000000000000000') {
    const msgData = {
      FunctionLockTokens: {
        destination_chain_data: {
          address: state.addressTo, // TODO
          amount: state.destinationAmount, // TODO
          chain_id: state.chainToId,
          token_address: state.tokenToId,
        },
        fee_amount: state.feeAmount,
        fee_token_id: state.tokenFromId,
        note: 'aramid-fe',
        payment_type: 'SameTokenPayment',
        root_amount: state.destinationAmount, // todo
        root_token_id: state.tokenFromId,
        sender_id: state.addressFrom, // todo
      },
    };

    const tx = await appData.nearWallet?.callMethod({
      method: 'ft_transfer_call',
      args: {
        receiver_id: CONTRACT_ADDRESS(ENV, appData?.publicConfiguration),
        amount: appData.sourceAmount,
        memo: null,
        msg: JSON.stringify(msgData),
      },
      contractId: appData.sourceTokenConfiguration.tokenId,
      deposit: '1',
      gas: '75000000000000',
    });
    // console.log('file: Review.tsx:714  submitNearTx  tx:', tx);
  } else {
    const msgData = {
      input: {
        fee_token_id: '0000000000000000000000000000000000000000000000000000000000000000',
        fee_amount: appData.feeAmount,
        root_amount: new BigNumber(appData.sourceAmount).minus(appData.feeAmount).toNumber().toLocaleString('fullwide', { useGrouping: false }),
        destination_chain_data: {
          chain_id: appData.destinationTokenConfiguration.chainId,
          token_address: appData.destinationTokenConfiguration.tokenId,
          amount: appData?.destinationAmount,
          address: appData.destinationAddress,
        },
        note: 'aramid-fe',
        payment_type: 'SameTokenPayment',
      },
    };
    const tx = await appData.nearWallet?.callMethod({
      method: 'lock_native_currency',
      args: msgData,
      contractId: CONTRACT_ADDRESS(appData?.appConfiguration?.environment, appData?.publicConfiguration),
      deposit: '1',
      gas: '75000000000000',
    });
  }
};
const algoPaymentQRCodeLink = () => {
  const payTo = state.config.chains[state.chainFromId].address;
  const amount = state.amountUint;
  let asset = '';
  if (state.tokenFromId > 0) {
    asset = '%26asset%3D' + state.tokenFromId;
  }
  var obj = {
    destinationNetwork: state.chainToId.toString(),
    destinationAddress: state.addressTo.toString(),
    destinationToken: state.tokenToId.toString(),
    feeAmount: state.feeAmount.toString(),
    sourceAmount: state.destinationAmount.toString(),
    destinationAmount: state.destinationAmount.toString(),
    note: 'BOS',
  };
  let note = 'xnote%3Daramid-transfer/v1:j' + JSON.stringify(obj);
  note = note.replace('/', '%2F');
  const code = `algorand%3A%2F%2F${payTo}%3Famount%3D${amount}${asset}%26${note}`;
  const ret = 'https://qrickit.com/api/qr.php?t=p&addtext=&txtcolor=000000&fgdcolor=000000&bgdcolor=FFFFFF&qrsize=300&d=' + code;
  console.log('qrcode', ret);
  return ret;
};
return (
  <div>
    {getConfig()}
    {!(state.config && state.config.addresses && state.config.addresses.proofs) ? (
      <>
        <div class="spinner-border" role="status"></div>
      </>
    ) : (
      <>
        {state.inSetup && (
          <>
            <h2>Bridge your assets. Select source chain</h2>
            <select class="form-control" value={state.chainFromId} onChange={e => onChangeChainFrom(e.target.value)}>
              <option value="" selected disabled>
                Please select chain
              </option>
              {Object.keys(state.config.chains).map(chainId => (
                <option value={chainId}>{state.config.chains[chainId].name}</option>
              ))}
            </select>
            {state.chainFromId && (
              <>
                <h2>Select destination chain</h2>
                <select class="form-control" value={state.chainToId} onChange={e => onChangeChainTo(e.target.value)}>
                  <option value="" selected disabled>
                    Please select chain
                  </option>
                  {Object.keys(state.config.chains2tokens[state.chainFromId]).map(chainId => (
                    <option value={chainId}>{state.config.chains[chainId].name}</option>
                  ))}
                </select>
              </>
            )}

            {state.chainToId && (
              <>
                <h2>Select source token</h2>
                <select class="form-control" value={state.tokenFromId} onChange={e => onChangeTokenFrom(e.target.value)}>
                  <option value="" selected disabled>
                    Please select source token
                  </option>
                  {Object.keys(state.config.chains2tokens[state.chainFromId][state.chainToId]).map(tokenId => (
                    <option value={tokenId}>{state.config.chains[state.chainFromId].tokens[tokenId].name}</option>
                  ))}
                </select>
              </>
            )}

            {state.tokenFromId && (
              <>
                <h2>Select destination token</h2>
                <select class="form-control" value={state.tokenToId} onChange={e => onChangeTokenTo(e.target.value)}>
                  <option value="" selected disabled>
                    Please select destination token
                  </option>
                  {Object.keys(state.config.chains2tokens[state.chainFromId][state.chainToId][state.tokenFromId]).map(tokenId => (
                    <option value={tokenId}>{state.config.chains[state.chainToId].tokens[tokenId].name}</option>
                  ))}
                </select>
              </>
            )}

            {state.tokenToId && (
              <>
                <h2>Select sender address</h2>
                <input class="form-control" value={state.addressFrom} onChange={e => onChangeAddressFrom(e.target.value)} placeholder="Please select sender address" />
              </>
            )}

            {state.addressFrom && (
              <>
                <h2>Select address where you want to bridge to</h2>
                <input class="form-control" value={state.addressTo} onChange={e => onChangeAddressTo(e.target.value)} placeholder="Please select receiver address" />
              </>
            )}

            {state.addressTo && (
              <>
                <h2>Select amount how much you want to bridge</h2>
                <input type="number" class="form-control" value={state.amount} onChange={e => onChangeAmount(e.target.value)} placeholder="Please select how much you want to bridge" />
              </>
            )}
            {state.amount > 0 && (
              <>
                <button class="btn btn-primary my-2" onClick={() => onClickReview()}>
                  Review transfer
                </button>
              </>
            )}
          </>
        )}
        {state.inReview && (
          <>
            <h2>Review transaction before bridging</h2>
            <button class="btn btn-light m-2 float-end" onClick={() => onClickReviewBack()}>
              Go back
            </button>

            <div>
              From chain: {state.config.chains[state.chainFromId].name} ({state.chainFromId})
            </div>
            <div>From account: {state.addressFrom}</div>
            <div>
              From token: {state.config.chains[state.chainFromId].tokens[state.tokenFromId].name} ({state.tokenFromId})
            </div>
            <div>Transfer amount: {state.amountFormatted}</div>
            <div>Fees amount: {state.feeAmountFormatted}</div>
            <div>Destination amount: {state.destinationAmountFormatted}</div>
            <div>
              Destination token: {state.config.chains[state.chainToId].tokens[state.tokenToId].name} ({state.tokenToId})
            </div>
            <div>Destination account: {state.addressTo}</div>
            <div>
              Destination chain: {state.config.chains[state.chainToId].name} ({state.chainToId})
            </div>
            <div>state.chainFromId {state.chainFromId}</div>
            {state.chainFromId >= '101001' && state.chainFromId <= '101003' && (
              <>
                <h3>Pay with QR code</h3>

                <iframe width="400" height="400" src={algoPaymentQRCodeLink()} frameborder="0" style={{ width: '400px', height: '400px' }}></iframe>
              </>
            )}
            <button class="btn btn-primary my-2" onClick={() => onClickBridge()}>
              Proceed with bridging
            </button>
          </>
        )}
        {state.inPayment && (
          <>
            <h2>Bridging is in progress</h2>
            <button class="btn btn-light m-2 float-end" onClick={() => onClickReviewBack()}>
              Go back
            </button>
          </>
        )}
      </>
    )}
    <div class="alert alert-danger my-5">THIS IS EXPERIMENTAL WEBSITE, PROCEED WITH CAUTION</div>
  </div>
);
