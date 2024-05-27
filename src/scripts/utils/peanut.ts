
import artifact from "../cookbook/contract/IPeanut.json";
import { providers, Contract } from "ethers5"
//https://dev.to/atosh502/install-multiple-versions-of-same-package-using-yarn-2668
import peanut from '@squirrel-labs/peanut-sdk';
const ALCHEMY_GOERLI = process.env.REACT_APP_ALCHEMY_BNB
const provider = new providers.JsonRpcProvider(ALCHEMY_GOERLI)
const contract = new Contract(
  "0xdFB4fbbaf602C76E5B30d0E97F01654D71F23e54",
  artifact.abi,
  provider,
)

export async function getPeanutLink(amount: number, txHash: string, password: string): Promise<string> {

  const linkDetails = {
    chainId: 5,
    tokenAmount: amount,
    tokenType: 0,  // 0 for ether, 1 for erc20, 2 for erc721, 3 for erc1155
  }

  console.log("provider: ", provider)

  const linksFromTxResp = await peanut.getLinksFromTx({
    linkDetails: linkDetails,
    txHash: txHash,
    passwords: [password],
    provider: provider
  })

  console.log("linksFromTxResp: ", linksFromTxResp)

  return linksFromTxResp.links[0];
}

export async function getPassword() {
  return await peanut.getRandomString(16)
}

export async function getPeanutTokenAmountFromLink(link: string): Promise<any[]> {
  const params = await peanut.getParamsFromLink(link)
  const deposit = await contract.callStatic.getDeposit(params.depositIdx)

  return [deposit.tokenAddress, deposit.amount]

}