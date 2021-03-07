<script lang="ts">
    import type { WalletState } from "../../machinery/WalletState";
    import {tools} from "nanocurrency-web";
    import {updateAccountInWallet} from "../../machinery/nano-ops";
    import {navigationReload, pushAccountAction, pushToast} from "../../machinery/eventListener";
    import {load} from "../../machinery/loader-store";
    import {onMount} from "svelte";
    import {setWalletState, updateWalletState} from "../../machinery/WalletState";
    import NumberInput from "../../components/input/NumberInput.svelte";
    import TextArea from "../../components/input/TextArea.svelte";
    import {setSoftwareKeys} from "../../machinery/SoftwareKeysState";
    import {getLanguage} from "../../machinery/language";
    import Text from "../../components/Text.svelte";
    import {rawToReadable} from "../../machinery/text-utils";
    import {client, fromAccount, toAccount} from "../../machinery/nano-client";
    import * as NanoClient from "@nanobox/nano-client/dist/models";

    export let walletState: WalletState;
    $: wallet = walletState.wallet;
    $: account = walletState.account;
    $: balance = account.balance;

    let toAddress: string = walletState.sendToAddress || ''
    let sending: boolean = false;
    let sendValue: number | undefined = undefined

    const softwareKeys = (disabledSend, disabledMax) => {
        return {
            leftKey: {
                languageId: 'update-button',
                onClick: async() => {
                    await load({
                        languageId: 'loading-refresh',
                        load: async () => {
                            await updateWalletState(account, wallet, toAddress)
                        }
                    })
                }
            },
            middleKey: {
                disabled: disabledSend,
                languageId: 'send-button',
                onClick: send
            },
            rightKey: {
                disabled: disabledMax,
                languageId: 'set-max-button',
                onClick: setMax
            },
        }
    }

    $: readableBalance = balance ? rawToReadable(balance) : ''
    $: numberBalance = balance ? NanoClient.NANO.fromRAW(balance.raw).asNumber : 0
    $: disabledMax = numberBalance <= 0;
    $: {
        const sendAsNumber = sendValue
        const canSend = (toAddress ? tools.validateAddress(toAddress) : false) && sendAsNumber <= numberBalance && sendAsNumber > 0
        setSoftwareKeys(softwareKeys(!canSend, disabledMax))
    }
    $: balanceString = `${getLanguage('current-balance')}: ${readableBalance} Nano`

    const setMax = async () => {
        if (balance && balance.raw && numberBalance > 0) {
            sendValue = NanoClient.NANO.fromRAW(balance.raw).asNumber
        }
    }

    const send = async () => {
        await load({
            languageId: 'sending-funds',
            load: async () => {
                const updated: NanoClient.NanoAccount | undefined = await client.send(toAccount(account), toAddress, NanoClient.NANO.fromNumber(sendValue))
                const updatedAccount = updated ? fromAccount(account, updated) : undefined
                if (updatedAccount) {
                    setWalletState({
                        wallet: updateAccountInWallet(updatedAccount, wallet),
                        account: updatedAccount,
                        transactions: walletState.transactions,
                        transaction: walletState.transaction,
                    })
                    pushToast({languageId: 'sent-funds-success', type: 'success'})
                    pushAccountAction('menu')
                } else {
                    pushToast({languageId: 'unable-to-send', type: 'warn'})
                }
            },
        })
    }

    onMount(() => navigationReload(softwareKeys(true, disabledMax)))

</script>
<Text>{balanceString}</Text>
<TextArea languageId="send-address" bind:value={toAddress}/>
<NumberInput languageId="send-amount" bind:value={sendValue}/>
