import { NanoClient } from '@nanobox/nano-client';
import type * as Models from '@nanobox/nano-client/dist/models';
import type { NanoAccount, NanoTransaction } from './models';
import { NANO } from '@nanobox/nano-client/dist/models';

export function toAccount(a: NanoAccount): Models.NanoAccount {
  return {
    address: a.address,
    privateKey: a.privateKey,
    publicKey: a.publicKey,
    balance: a.balance ? NANO.fromRAW(a.balance.raw) : NANO.ZERO,
  };
}

export function fromAccount(
  existing: NanoAccount,
  updated: Models.NanoAccount
): NanoAccount {
  return {
    ...existing,
    balance: { raw: updated.balance.RAW },
    representative: updated.representative,
  };
}

export function toTransaction(t: Models.NanoTransaction): NanoTransaction {
  return {
    account: t.account,
    amount: { raw: t.amount.RAW },
    localTimestamp: t.localTimestamp,
    type: t.type,
  };
}

export const client: NanoClient = new NanoClient({
  url: 'https://kaiak.cc/node',
});
