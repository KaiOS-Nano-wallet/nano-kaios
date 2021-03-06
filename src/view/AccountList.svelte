<script lang="ts">
    import List from "../components/List.svelte";
    import Content from "../components/Content.svelte";
    import type {NanoAccount, NanoWallet} from "../machinery/models";
    import WithSecondary from "../components/list/WithSecondary.svelte";
    import {setWalletState, updateWalletState} from "../machinery/WalletState";
    import {navigationReload, pushAccountAction, pushMenu, pushToast} from "../machinery/eventListener";
    import {afterUpdate} from "svelte";
    import {load} from "../machinery/loader-store";
    import {addNanoAccount} from "../machinery/wallet";
    import {truncateNanoAddress, accountAliasOrFallback} from "../machinery/text-utils";
    import {SOFT_KEY_SELECT} from "../machinery/SoftwareKeysState";

    export let wallet: NanoWallet
    const selectAccount = async (account: NanoAccount) => {
        await load({
            languageId: 'loading-account',
            load: async () => {
                await updateWalletState(account, wallet)
                pushAccountAction('menu')
            },
        })
    }

    const addAccount = async () => {
        await load(
            {
                languageId: 'adding-account',
                load: async () => {
                    const updatedNanoWallet: NanoWallet | undefined = await addNanoAccount(wallet)
                    if (updatedNanoWallet) {
                        setWalletState({ wallet: updatedNanoWallet })
                    } else {
                        pushToast({languageId: 'unable-to-store'})
                    }
                },
            }
        )
    }

    afterUpdate(() => {
        navigationReload(
            {
                leftKey: {
                    languageId: 'add-account',
                    onClick: async () => addAccount()
                },
                middleKey: SOFT_KEY_SELECT,
                rightKey: {
                    languageId: 'menu',
                    onClick: async () => pushMenu('menu')
                }
            }
        )
    })

</script>

<Content titleKey="wallet">
    <List>
        {#each wallet.accounts as account}
            <WithSecondary primaryText={account.alias} primaryLanguageId={accountAliasOrFallback(account)} on:click={() => selectAccount(account)} secondaryText={truncateNanoAddress(account.address)} />
        {/each}
    </List>
</Content>
