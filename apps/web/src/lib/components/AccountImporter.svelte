<script lang="ts">
	import { appStore } from '$lib/stores/app.svelte';
	import { parseProfileHtml } from '$lib/utils/parser';
	import { validateAccountName } from '$lib/utils/validation';
	import type { Character } from '$lib/types';

	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Input } from '$lib/components/ui/input';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogFooter,
	} from '$lib/components/ui/dialog';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import CharacterCard from './CharacterCard.svelte';
	import { IconAlertCircle } from '@tabler/icons-svelte';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}

	let { open = $bindable(), onOpenChange }: Props = $props();

	let htmlInput = $state('');
	let accountName = $state('');
	let parsedCharacters = $state<Character[]>([]);
	let error = $state('');
	let isParsing = $state(false);

	function parseHtml() {
		if (!htmlInput.trim()) {
			error = 'Please paste HTML content';
			return;
		}

		isParsing = true;
		error = '';

		try {
			const result = parseProfileHtml(htmlInput);
			parsedCharacters = result.characters.map((char) => ({
				...char,
				accountId: '', // Will be set on save
			}));

			if (parsedCharacters.length === 0) {
				error = 'No characters found in the HTML. Make sure you paste the full profile page.';
			} else if (!accountName) {
				accountName = result.accountName;
			}
		} catch (err) {
			error = 'Failed to parse HTML. Please check the content and try again.';
			parsedCharacters = [];
		} finally {
			isParsing = false;
		}
	}

	function saveAccount() {
		const validationErrors = validateAccountName(accountName);
		if (validationErrors.length > 0) {
			error = validationErrors[0].message;
			return;
		}

		if (parsedCharacters.length === 0) {
			error = 'No characters to save';
			return;
		}

		// Check for duplicate account
		const existingAccount = appStore.accounts.find(
			(a) => a.name.toLowerCase() === accountName.toLowerCase()
		);
		if (existingAccount) {
			error = `Account "${accountName}" already exists`;
			return;
		}

		const accountId = crypto.randomUUID();
		const characters = parsedCharacters.map((char) => ({
			...char,
			accountId,
		}));

		appStore.addAccount({
			id: accountId,
			name: accountName,
			characters,
		});

		reset();
		onOpenChange(false);
	}

	function reset() {
		htmlInput = '';
		accountName = '';
		parsedCharacters = [];
		error = '';
	}

	function handleCancel() {
		reset();
		onOpenChange(false);
	}
</script>

<Dialog {open} onOpenChange={onOpenChange}>
	<DialogContent class="max-h-[90vh] max-w-2xl overflow-y-auto">
		<DialogHeader>
			<DialogTitle>Import Account</DialogTitle>
		</DialogHeader>

		<div class="flex flex-col gap-4 py-4">
			{#if error}
				<Alert variant="destructive">
					<IconAlertCircle class="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			{/if}

			<div class="space-y-2">
				<label for="html-input" class="text-sm font-medium">
					Paste profile HTML
				</label>
				<Textarea
					id="html-input"
					placeholder="Paste the full HTML from your Margonem profile page..."
					bind:value={htmlInput}
					rows={6}
					class="font-mono text-xs"
				/>
			</div>

			<Button onclick={parseHtml} disabled={!htmlInput.trim() || isParsing}>
				{isParsing ? 'Parsing...' : 'Parse HTML'}
			</Button>

			{#if parsedCharacters.length > 0}
				<div class="space-y-2">
					<label for="account-name" class="text-sm font-medium">
						Account Name
					</label>
					<Input
						id="account-name"
						bind:value={accountName}
						placeholder="Enter account name"
					/>
				</div>

				<div class="space-y-2">
					<div class="text-sm font-medium">
						Found {parsedCharacters.length} character{parsedCharacters.length === 1
							? ''
							: 's'}
					</div>
					<div class="grid max-h-60 gap-2 overflow-y-auto">
						{#each parsedCharacters as character (character.id)}
							<CharacterCard {character} disabled={true} class="pointer-events-none" />
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={handleCancel}>Cancel</Button>
			<Button
				onclick={saveAccount}
				disabled={parsedCharacters.length === 0 || !accountName.trim()}
			>
				Save Account
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
