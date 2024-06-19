/*
1: unshield ERC20
2: approve dex
3: swap ERC20 for ETH
4: deposit ETH to peanut
*/

import {
  fullWalletForID,
  refreshBalances,
  generateCrossContractCallsProof,
  populateProvedCrossContractCalls
} from '@railgun-community/wallet';
import {
  NetworkName,
  NETWORK_CONFIG,
  RailgunERC20AmountRecipient,
  RailgunWalletInfo,
} from '@railgun-community/shared-models';
import {
  RecipeERC20Amount,
  RecipeInput
} from "@railgun-community/cookbook"
import { PrivateTransferRecipe } from './cookbook/recipes/private-transfer-recipe';
import { getGasDetailsERC20, setRailgunGas } from './utils/gas';
import { getPeanutLink } from "./utils/peanut"
import { sendTx } from "./utils/relayer"
import { TXIDVersion } from '@railgun-community/shared-models';
const peanutAddress = "0xdFB4fbbaf602C76E5B30d0E97F01654D71F23e54"
const chainBNB = NETWORK_CONFIG.BNB_Chain.chain;

// TODO1: should return link
export async function privateTransfer(
  railgunWalletInfo: RailgunWalletInfo,
  encryptionKey: string,
  tokenAddr: string,
  amount: number
): Promise<{
  txHash: string,
  peanutLink: string
}> {

  /* TODO2: this initialization part should be moved out to somewhere else in browser
  initEngine();
  await initEngineNetwork();
 
  // @ts-ignore
  getProver().setSnarkJSGroth16(groth16 as SnarkJSGroth16);
 
  const encryptionKey = await pbkdf2(secret, "0x0", 1000000);
 
  const railgunWalletInfo = await createRailgunWallet(
      encryptionKey,
      mnemonic,
      undefined, // creationBlockNumbers
    );
  
  if (!railgunWalletInfo) {
      throw new Error('Expected railgunWalletInfo');
  }
  
  */ /// 
  await setRailgunGas()

  const railgunWallet = await fullWalletForID(railgunWalletInfo.id);
  const railgunAddress = railgunWalletInfo.railgunAddress

  // Inputs that will be unshielded from private balance.
  const unshieldERC20Amounts: RecipeERC20Amount = {
    tokenAddress: tokenAddr,
    decimals: BigInt('0x12'),
    amount: BigInt(amount * 1e18)
  };

  const recipeInput: RecipeInput = {
    railgunAddress: railgunAddress,
    networkName: NetworkName.BNBChain,
    erc20Amounts: [unshieldERC20Amounts],
    nfts: [],
  };

  const deposit = new PrivateTransferRecipe(peanutAddress);
  const { crossContractCalls, feeERC20AmountRecipients } = await deposit.getRecipeOutput(recipeInput, false, true);
  console.log("crossContractCalls: ", crossContractCalls)

  //   const selectedRelayer = getRailgunSmartWalletContractForNetwork(NetworkName.EthereumGoerli)
  //   const relayerFeeERC20AmountRecipient: RailgunERC20AmountRecipient = {
  //     tokenAddress: tokenAddr,
  //     recipientAddress: selectedRelayer?.address as string,
  //     amount: feeERC20AmountRecipients[0].amount
  //   }

  const sendWithPublicWallet = true

  // console.log("relayerFeeERC20AmountRecipient: ", relayerFeeERC20AmountRecipient)

  const refreshthebalance = await refreshBalances(chainBNB, railgunWallet.id);

  const gasDetails = await getGasDetailsERC20(
    railgunWallet.id,
    encryptionKey,
    [unshieldERC20Amounts],
    [],
    crossContractCalls
  )

  await generateCrossContractCallsProof(
    TXIDVersion.V2_PoseidonMerkle,
    NetworkName.BNBChain as any,
    railgunWallet.id,
    encryptionKey,
    [unshieldERC20Amounts],
    [],
    [],
    [],
    crossContractCalls,
    // relayerFeeERC20AmountRecipient,
    undefined,
    sendWithPublicWallet,
    BigInt('0x1000'),
    undefined,
    () => { }
  )

  const { transaction } = await populateProvedCrossContractCalls(
    TXIDVersion.V2_PoseidonMerkle,
    NetworkName.BNBChain as any,
    railgunWallet.id,
    [unshieldERC20Amounts],
    [],
    [],
    [],
    crossContractCalls,
    // relayerFeeERC20AmountRecipient,
    undefined,
    sendWithPublicWallet,
    BigInt('0x1000'),
    gasDetails
  );

  console.log("transaction: ", transaction)

  // const txHash = await sendTxRailgunRelayer(transaction, selectedRelayer)
  const txHash: string | undefined = await sendTx(transaction);


  let peanutLink: string | undefined;

  console.log('txHash :', txHash);

  peanutLink = await getPeanutLink(amount, txHash, deposit.password);
  console.log("peanutLink: ", peanutLink)
  return {
    txHash,
    peanutLink
  }


}
