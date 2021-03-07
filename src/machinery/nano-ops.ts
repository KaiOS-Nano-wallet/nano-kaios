import type { NanoAccount, NanoAddress, NanoWallet } from './models';

export const DEFAULT_REP: NanoAddress =
  'nano_1kaiak5dbaaqpenb7nshqgq9tehgb5wy9y9ju9ehunexzmkzmzphk8yw8r7u';

/** Updates account in account list */
export function updateAccountInWallet(
  updatedAccount: NanoAccount,
  wallet: NanoWallet
): NanoWallet {
  wallet.accounts = wallet.accounts.map((account) => {
    return account.address === updatedAccount.address
      ? updatedAccount
      : account;
  });
  return wallet;
}
