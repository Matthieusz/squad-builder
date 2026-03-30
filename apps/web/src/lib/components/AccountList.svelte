<script lang="ts">
	import { appStore } from '$lib/stores/app.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
	} from '$lib/components/ui/dialog';
	import { IconChevronDown, IconChevronUp, IconTrash, IconUserPlus } from '@tabler/icons-svelte';
	import CharacterCard from './CharacterCard.svelte';

	interface Props {
		onAddAccount: () => void;
	}

	let { onAddAccount }: Props = $props();

	let expandedAccounts = $state<Set<string>>(new Set());
	let accountToDelete = $state<string | null>(null);

	function toggleAccount(accountId: string) {
		const newSet = new Set(expandedAccounts);
		if (newSet.has(accountId)) {
			newSet.delete(accountId);
		} else {
			newSet.add(accountId);
		}
		expandedAccounts = newSet;
	}

	function confirmDelete(accountId: string) {
		accountToDelete = accountId;
	}

	function cancelDelete() {
		accountToDelete = null;
	}

	function executeDelete() {
		if (accountToDelete) {
			appStore.removeAccount(accountToDelete);
			accountToDelete = null;
		}
	}

	function getAccountName(id: string): string {
		return appStore.accounts.find((a) => a.id === id)?.name ?? 'Unknown';
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">Accounts</h2>
		<Button onclick={onAddAccount} size="sm">
			<IconUserPlus class="mr-2 h-4 w-4" />
			Add Account
		</Button>
	</div>

	{#if appStore.accounts.length === 0}
		<div class="rounded-lg border border-dashed p-8 text-center">
			<p class="text-sm text-muted-foreground">
				No accounts imported yet.
			</p>
			<p class="text-xs text-muted-foreground/70">
				Click "Add Account" to import characters from a profile page.
			</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each appStore.accounts as account (account.id)}
				<div class="rounded-lg border">
					<button
						type="button"
						class="flex w-full items-center justify-between p-3 hover:bg-muted/50"
						onclick={() => toggleAccount(account.id)}
					>
						<div class="flex items-center gap-3">
							<span class="font-medium">{account.name}</span>
							<span class="text-xs text-muted-foreground">
								{account.characters.length} character{account.characters.length ===
								1
									? ''
									: 's'}
							</span>
						</div>
						<div class="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								class="h-8 w-8"
								onclick={(e) => {
									e.stopPropagation();
									confirmDelete(account.id);
								}}
							>
								<IconTrash class="h-4 w-4 text-destructive" />
							</Button>
							{#if expandedAccounts.has(account.id)}
								<IconChevronUp class="h-4 w-4 text-muted-foreground" />
							{:else}
								<IconChevronDown class="h-4 w-4 text-muted-foreground" />
							{/if}
						</div>
					</button>

					{#if expandedAccounts.has(account.id)}
						<div class="border-t p-3">
							<div class="grid gap-2">
								{#each account.characters as character (character.id)}
									<CharacterCard {character} disabled={true} class="pointer-events-none" />
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
<Dialog open={accountToDelete !== null} onOpenChange={() => (accountToDelete = null)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Delete Account</DialogTitle>
			<DialogDescription>
				Are you sure you want to delete "{accountToDelete
					? getAccountName(accountToDelete)
						: ''}"? This will remove all
				{accountToDelete
					? appStore.accounts.find((a) => a.id === accountToDelete)?.characters.length ??
						0
						: 0}
				characters and remove them from all squads. This action cannot be undone.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<Button variant="outline" onclick={cancelDelete}>Cancel</Button>
			<Button variant="destructive" onclick={executeDelete}>Delete</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
