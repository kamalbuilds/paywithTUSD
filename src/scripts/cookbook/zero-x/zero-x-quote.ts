import { NETWORK_CONFIG, NetworkName } from '@railgun-community/shared-models';
import { AxiosError } from 'axios';
import { getContractAddressesForChainOrThrow } from '@0x/contract-addresses';
import {
  getZeroXData,
  ZeroXApiEndpoint,
  zeroXApiSubdomain,
} from "./zerp-x-fetch"
import {
  GetSwapQuote,
  RecipeERC20Info,
  SwapQuoteData,
  SwapQuoteParams,
} from '@railgun-community/cookbook';
import { ContractTransaction, parseUnits } from 'ethers';
import {Optional} from "../../utils/type"

export const minBalanceAfterSlippage = (
  balance: bigint,
  slippageBasisPoints: bigint,
): bigint => {
  const slippageMax = (balance * slippageBasisPoints) / 10000n;
  return balance - slippageMax;
};

export const ZERO_X_PRICE_DECIMALS = 18;

type ZeroXAPIPriceData = {
  price: string;
  guaranteedPrice: string;
  buyAmount: string;
  allowanceTarget: string;
  to: string;
  data: string;
  value: string;
  sellTokenAddress: string;
  sellAmount: string;
};

type ZeroXAPIQuoteParams = {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  slippagePercentage: string;
};

const NULL_SPENDER_ADDRESS = '0x0000000000000000000000000000000000000000';

const ZERO_X_PROXY_BASE_TOKEN_ADDRESS =
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export class ZeroXQuote {
  private static getZeroXTokenAddress = (erc20: RecipeERC20Info) => {
    if (erc20.isBaseToken ?? false) {
      return ZERO_X_PROXY_BASE_TOKEN_ADDRESS;
    }
    return erc20.tokenAddress;
  };

  static zeroXExchangeProxyContractAddress = (networkName: NetworkName) => {
    const { chain } = NETWORK_CONFIG[networkName];
    const addresses = getContractAddressesForChainOrThrow(chain.id);
    return addresses.exchangeProxy;
  };

  static supportsNetwork = (networkName: NetworkName) => {
    try {
      zeroXApiSubdomain(networkName);
      return true;
    } catch {
      return false;
    }
  };

  private static getZeroXQuoteInvalidError = (
    networkName: NetworkName,
    to: string,
    sellTokenAddress: string,
    buyTokenAddress: string,
  ): Optional<Error> => {
    try {
      // Validate "to" address.
      const exchangeProxyContractAddress =
        this.zeroXExchangeProxyContractAddress(networkName);
      if (
        ![
          exchangeProxyContractAddress.toLowerCase(),
          sellTokenAddress.toLowerCase(), // Could be wrapped token contract
          buyTokenAddress.toLowerCase(), // Could be wrapped token contract
        ].includes(to.toLowerCase())
      ) {
        throw new Error(
          `Invalid 0x Exchange contract address: ${to} vs ${exchangeProxyContractAddress}`,
        );
      }

      return undefined;
    } catch (err) {
      return err;
    }
  };

  static getSwapQuote: GetSwapQuote = async ({
    networkName,
    sellERC20Amount,
    buyERC20Info,
    slippageBasisPoints,
    isRailgun,
  }: SwapQuoteParams): Promise<SwapQuoteData> => {
    console.log("1")
    if (sellERC20Amount.amount === 0n) {
      throw new Error('Swap sell amount is 0.');
    }

    const sellTokenAddress = this.getZeroXTokenAddress(sellERC20Amount);
    const buyTokenAddress = this.getZeroXTokenAddress(buyERC20Info);

    console.log("2")
    if (sellTokenAddress === buyTokenAddress) {
      throw new Error('Swap sell and buy tokens are the same.');
    }

    const slippagePercentage = Number(slippageBasisPoints) / 10000;
    const params: ZeroXAPIQuoteParams = {
      sellToken: sellTokenAddress,
      buyToken: buyTokenAddress,
      sellAmount: sellERC20Amount.amount.toString(),
      slippagePercentage: String(slippagePercentage),
    };

    console.log("3")
    try {
      const {
        price,
        buyAmount,
        guaranteedPrice,
        allowanceTarget,
        to,
        data,
        value,
        sellTokenAddress: sellTokenAddressResponse,
        sellAmount: sellTokenValueResponse,
      } = await getZeroXData<ZeroXAPIPriceData>(
        ZeroXApiEndpoint.GetSwapQuote,
        NetworkName.BNBChain as any,
        isRailgun,
        params,
      );

      console.log("4")

      const invalidError = this.getZeroXQuoteInvalidError(
        NetworkName.BNBChain as any,
        to,
        sellTokenAddress,
        buyTokenAddress,
      );

      console.log("5")
      if (invalidError) {
        throw invalidError;
      }

      console.log("6")
      const minimumBuyAmount = minBalanceAfterSlippage(
        BigInt(buyAmount),
        slippageBasisPoints,
      );
      const crossContractCall: ContractTransaction = {
        to: to,
        data: data,
        value: BigInt(value),
      };
      const spender: Optional<string> =
        allowanceTarget === NULL_SPENDER_ADDRESS ? undefined : allowanceTarget;

        console.log("7")
      return {
        price: parseUnits(price, ZERO_X_PRICE_DECIMALS),
        guaranteedPrice: parseUnits(guaranteedPrice, ZERO_X_PRICE_DECIMALS),
        buyERC20Amount: {
          ...buyERC20Info,
          amount: BigInt(buyAmount),
        },
        minimumBuyAmount,
        spender,
        crossContractCall,
        slippageBasisPoints,
        sellTokenAddress: sellTokenAddressResponse,
        sellTokenValue: sellTokenValueResponse,
      };
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const msg = this.formatApiError(err);
      throw new Error(msg);
    }
  };

  private static formatApiError = (err: AxiosError<any> | Error): string => {
    if (!(err instanceof AxiosError)) {
      return err.message;
    }
    try {
      // Axios Errors come back as 400 with this format:
      // err.response.data.reason
      // err.response.data.validationErrors[].reason

      const { response } = err as AxiosError<any>;
      if (!response) {
        return `0x API request failed: ${err.message}.`;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = response?.data;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const firstValidationErrorReason = data?.validationErrors[0].reason;

      if (firstValidationErrorReason === 'INSUFFICIENT_ASSET_LIQUIDITY') {
        return 'Insufficient liquidity. One of the selected tokens is not supported by the 0x Exchange.';
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return `0x Exchange: ${response?.data.reason}. ${firstValidationErrorReason}.`;
    } catch {
      return `0x API request failed: ${err.message}.`;
    }
  };
}