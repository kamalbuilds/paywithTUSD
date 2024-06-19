import {
    EVMGasType,
    TransactionGasDetails,
    getEVMGasTypeForTransaction,
    RailgunERC20AmountRecipient,
    NetworkName,
    TXIDVersion
  } from '@railgun-community/shared-models';
  import {
    populateShield,
  } from '@railgun-community/wallet';
  import {
    gasEstimateForShield,
    getShieldPrivateKeySignatureMessage,
  } from '@railgun-community/wallet';
  import { ethers, keccak256, Wallet } from 'ethers';


  export async function shieldToken() {

  
  // Formatted token amounts and recipients.
  const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
    {
      tokenAddress: '0x1D16921ad3cB0CcF87de07d4C28bEb959c6ef771', // TUSD
      amount: BigInt('0x10') as bigint, // hexadecimal amount
      recipientAddress: '0zk1qyd5dug9wvcks8cat067p8fq7h356rsydgjpugup8yjll5z7adqkfrv7j6fe3z53la5gq2045xcg2jl66gc67fvg5g4nyh37t2glql4hrcvjqtdc3c9cx6uv2ks', // RAILGUN address
    },
    // {
    //   tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    //   amount: BigInt('0x20'), // hexadecimal amount
    //   recipientAddress: '0zk1qyd5dug9wvcks8cat067p8fq7h356rsydgjpugup8yjll5z7adqkfrv7j6fe3z53la5gq2045xcg2jl66gc67fvg5g4nyh37t2glql4hrcvjqtdc3c9cx6uv2ks', // RAILGUN address
    // },
  ];

  console.log(erc20AmountRecipients,"erc20AmountRecipients here>>>")
  
  // The shieldPrivateKey enables the sender to decrypt 
  // the receiver's address in the future.
  const pKey = process.env.REACT_APP_PRIVATE_KEY; // Private key of public wallet we are shielding from

  const provider = new ethers.JsonRpcProvider('https://eth-sepolia.public.blastapi.io');

  const wallet = new Wallet(pKey, provider);

  console.log(wallet,"wallet here>>>")

  const shieldSignatureMessage = getShieldPrivateKeySignatureMessage();
  console.log(shieldSignatureMessage,"shieldSignatureMessage here>>>")
  const shieldPrivateKey = keccak256(
    await wallet.signMessage(shieldSignatureMessage),
  );
  
  console.log(shieldPrivateKey,"pvt key ")
  // Address of public wallet we are shielding from
  const fromWalletAddress = '0xCDBd94650047Ca3C8956e1B2dc668596EB87e64f';
  
  // const a = await gasEstimateForShield(
  //   TXIDVersion.V2_PoseidonMerkle,
  //   NetworkName.BNBChain as any,
  //   shieldPrivateKey,
  //   erc20AmountRecipients,  
  //   [], // nftAmountRecipients
  //   fromWalletAddress,
  // );
  // console.log(a,"a here>>>")
  // const gasEstimate = a.gasEstimate;

  // console.log(gasEstimate,"gasEstimate here>>>")
  
  // send with public wallet
  
  const sendWithPublicWallet = true; // Always true for Shield transactions
  // const evmGasType: EVMGasType = getEVMGasTypeForTransaction(
  //   NetworkName.BNBChain,
  //   sendWithPublicWallet
  // );

  
  // let gasDetails: TransactionGasDetails;
  // switch (evmGasType) {
  //   case EVMGasType.Type0:
  //   case EVMGasType.Type1:
  //     gasDetails = {
  //       evmGasType,
  //       gasEstimate,
  //       gasPrice: BigInt('0x100000'), // Proper calculation of network gasPrice is not covered in this guide
  //     }
  //     break;
  //   case EVMGasType.Type2:
  //     // Proper calculation of gas Max Fee and gas Max Priority Fee is not covered in this guide. See: https://docs.alchemy.com/docs/how-to-build-a-gas-fee-estimator-using-eip-1559
  //     const maxFeePerGas = BigInt('0x100000');
  //     const maxPriorityFeePerGas=  BigInt('0x010000');
  
  //     gasDetails = {
  //       evmGasType,
  //       gasEstimate,
  //       maxFeePerGas,
  //       maxPriorityFeePerGas,
  //     }
  //     break;
  // }

  const { transaction } = await populateShield(
    TXIDVersion.V2_PoseidonMerkle,
    NetworkName.BNBChain,
    shieldPrivateKey,
    erc20AmountRecipients,  
    [], // nftAmountRecipients
    // gasDetails,
  );
  
  // Public wallet to shield from.
  transaction.from = '0xCDBd94650047Ca3C8956e1B2dc668596EB87e64f';

  wallet.sendTransaction(transaction);

  }
  
  // Send transaction. e.g. const wallet = new Wallet(pKey, provider); wallet.sendTransaction(transaction); from ethers.js