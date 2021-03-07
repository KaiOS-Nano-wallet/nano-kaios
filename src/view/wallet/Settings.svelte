<script lang="ts">
    import type {NanoAccount, NanoWallet} from "../../machinery/models";
    import Seperator from "../../components/Seperator.svelte";
    import {setWallet} from "../../machinery/secure-storage";
    import {setWalletState} from "../../machinery/WalletState";
    import {back, navigationReload, pushToast} from "../../machinery/eventListener";
    import {onMount} from "svelte";
    import TextInput from "../../components/input/TextInput.svelte";
    import Text from "../../components/Text.svelte";
    import TextArea from "../../components/input/TextArea.svelte";
    import {tools} from "nanocurrency-web";
    import {client, toAccount} from "../../machinery/nano-client";

    export let wallet: NanoWallet;
    export let selectedAccount: NanoAccount;

    let aliasValue: string = selectedAccount.alias
    let representativeValue: string = selectedAccount.representative

    const setAlias = (event) => aliasValue = event.target.value;

    const save = async () => {
        if(aliasValue.length < 3) {
            pushToast({languageId: 'onboard-alias-rule'})
            return;
        }
        if(representativeValue !== undefined && !tools.validateAddress(representativeValue)) {
            pushToast({languageId: 'invalid-address'})
            return;
        }
        selectedAccount.alias = aliasValue
        selectedAccount.representative = representativeValue;
        await client.setRepresentative(toAccount(selectedAccount))
        wallet.accounts = wallet.accounts.map(a => {
            if (a.address === selectedAccount.address) {
                return selectedAccount;
            } else return a;
        });
        const updated: NanoWallet | undefined = await setWallet(wallet)
        if (updated) {
            setWalletState({wallet: updated, account: selectedAccount})
            back()
        } // TODO: Toast
    }

    onMount(() => navigationReload({
        middleKey: {
            languageId: 'button-save',
            onClick: save
        }
    }));

</script>

<Seperator languageId="onboard-set-alias" />
<Text languageId="onboard-set-alias-text"/>
<TextInput languageId="account-alias" value={selectedAccount.alias} on:input={setAlias}/>
<Seperator languageId="representative" />
<Text languageId="representative-text"/>
<TextArea languageId="set-representative" bind:value={representativeValue}/>
