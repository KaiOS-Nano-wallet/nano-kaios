import type {
  NanoAccount,
  NanoAddress,
  NanoTransaction,
  NanoWallet,
} from './models';
import { updateAccountInWallet } from './nano-ops';
import { pushToast } from './eventListener';
import { writable, Writable } from 'svelte/store';
import { client, fromAccount, toAccount, toTransaction } from './nano-client';

export interface WalletState {
  wallet?: NanoWallet;
  transactions?: NanoTransaction[];
  account?: NanoAccount;
  transaction?: NanoTransaction;
  sendToAddress?: NanoAddress;
}

export function setWalletState(walletState: WalletState) {
  walletStore.set(walletState);
}

export async function updateWalletState(
  nanoAccount: NanoAccount,
  wallet: NanoWallet,
  sendToAddress?: NanoAddress
): Promise<void> {
  const {
    account: updatedAccount,
    resolvedCount,
    error,
  } = await client.receive(toAccount(nanoAccount), 0);
  const updated = fromAccount(nanoAccount, updatedAccount);
  const resolvedTransactions = await client.getTransactions(
    nanoAccount.address
  );
  if (resolvedCount > 0) {
    pushToast({ languageId: 'got-new-transactions', type: 'success' });
  } else if (error) {
    pushToast({ languageId: error, type: 'warn' });
  }
  setWalletState({
    wallet: updateAccountInWallet(updated, wallet),
    account: updated,
    transactions: resolvedTransactions.map(toTransaction),
    sendToAddress: sendToAddress,
  });
}

/** Handles updates of wallet */
export const walletStore: Writable<WalletState> = writable({
  wallet: undefined,
  transactions: undefined,
});
