import { 
    refreshBalances,
    fullWalletForID,
    balanceForERC20Token
 } from '@railgun-community/wallet';
 import {
    NetworkName,
    NETWORK_CONFIG,
    RailgunWalletInfo,
    TXIDVersion
  } from '@railgun-community/shared-models';

const chainBNB = NETWORK_CONFIG.BNB_Chain.chain;

export async function getPrivateBalance(railgunWalletInfo: RailgunWalletInfo, tokenAddress:string):Promise<bigint> {    
    const railgunWallet = await fullWalletForID(railgunWalletInfo.id);
    await refreshBalances(chainBNB, railgunWallet.id);

    const balance = await balanceForERC20Token(
        TXIDVersion.V2_PoseidonMerkle,
        railgunWallet,
        NetworkName.BNBChain,
        tokenAddress,
        false
    )

    console.log(`balance for ${tokenAddress}`, balance);
    console.log(railgunWallet)
    return balance
}