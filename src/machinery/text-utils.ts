import type { NanoTransaction, NanoAddress, NanoAccount, RAW } from './models';
import { getLanguage } from './language';
import dateFormat from 'dateformat';
import { BigNumber } from 'bignumber.js';
import { NANO } from '@nanobox/nano-client/dist/models';

export const transactionType = (transaction: NanoTransaction) => {
  switch (transaction.type) {
    case 'receive':
      return 'transaction-received';
    case 'send':
      return 'transaction-sent';
    default:
      return 'unknown';
  }
};

export const transactionReceived = (transaction: NanoTransaction) => {
  switch (transaction.type) {
    case 'receive':
      return 'transaction-received-at';
    case 'send':
      return 'transaction-sent-at';
    default:
      return 'unknown';
  }
};

export const direction = (transaction: NanoTransaction) => {
  switch (transaction.type) {
    case 'receive':
      return 'transaction-from';
    case 'send':
      return 'transaction-to';
    default:
      return 'unknown';
  }
};

/** How we present values to the user */
export const rawToReadable = (raw: RAW) => {
  const number = new BigNumber(NANO.fromRAW(raw.raw).asString);
  const decimalPlaces = number.decimalPlaces();
  const stringNumber = number.toFixed(Math.min(decimalPlaces, 6));
  if (decimalPlaces > 6) return `${stringNumber}..`;
  else return stringNumber;
};

export const transactionText = (transaction: NanoTransaction) => {
  return `${getLanguage(transactionType(transaction))} ${rawToReadable(
    transaction.amount
  )} ${getLanguage(direction(transaction))} ${truncateNanoAddress(
    transaction.account
  )}`;
};

export const transactionTime = (transaction: NanoTransaction) => {
  const date = new Date(Number(transaction.localTimestamp) * 1000);
  return `${getLanguage('at')} ${dateFormat(date)}`;
};

export function truncateNanoAddress(address: NanoAddress): string {
  return (
    address.substr(0, 9) +
    '.....' +
    address.substr(address.length - 5, address.length)
  );
}

export function accountAliasOrFallback(account: NanoAccount): string {
  return account.alias || 'unnamed-account';
}
