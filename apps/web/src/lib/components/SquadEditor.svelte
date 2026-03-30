<script lang="ts">
	import type { Squad, SquadGroup } from '$lib/types';
	import { appStore } from '$lib/stores/app.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
	} from '$lib/components/ui/dialog';
	import { validateSquadName } from '$lib/utils/validation';
	import { IconPlus, IconTrash, IconUsers } from '@tabler/icons-svelte';
	import CharacterCard from './CharacterCard.svelte';
	import CharacterPicker from './CharacterPicker.svelte';

	interface Props {
		group: SquadGroup;
		squad: Squad;
	}

	let { group, squad }: Props = $props();

	let showPicker = $state(false);
	let showDeleteConfirm = $state(false);
	let isEditingName = $state(false);
	let editedName = $state(squad.name);

	const squadCharacters = $derived(
		squad.characterIds
			.map((id) => appStore.findCharacterWithAccount(id))
			.filter((item): item is NonNullable<typeof item> => item !== null)
	);

	function handleAddCharacter() {
		if (squad.characterIds.length < 10) {
			showPicker = true;
		}
	}

	function handleSelectCharacter(characterId: string) {
		appStore.addCharacterToSquad(group.id, squad.id, characterId);
	}

	function handleRemoveCharacter(characterId: string) {
		appStore.removeCharacterFromSquad(group.id, squad.id, characterId);
	}

	function handleDelete() {
		appStore.removeSquad(group.id, squad.id);
	}

	function startEditingName() {
		editedName = squad.name;
		isEditingName = true;
	}

	function saveName() {
		const errors = validateSquadName(editedName);
		if (errors.length === 0) {
			appStore.updateSquadName(group.id, squad.id, editedName);
			isEditingName = false;
		}
	}

	function cancelEditName() {
		editedName = squad.name;
		isEditingName = false;
	}
</script>

<div class="rounded-lg border p-4">
	<div class="mb-4 flex items-start justify-between">
		<div class="flex-1">
			{#if isEditingName}
				<div class="flex items-center gap-2">
					<Input
						bind:value={editedName}
						onblur={saveName}
						onkeydown={(e) => {
							if (e.key === 'Enter') saveName();
							if (e.key === 'Escape') cancelEditName();
						}}
						class="h-8 text-sm"
						autofocus
					/>
				</div>
			{:else}
				<button
					type="button"
					class="text-left font-semibold hover:text-primary"
					onclick={startEditingName}
				>
					{squad.name}
				</button>
			{/if}
			<div class="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
				<IconUsers class="h-3 w-3" />
				<span>{squad.characterIds.length}/10 characters</span>
			</div>
		</div>
		<Button
			variant="ghost"
			size="icon"
			class="h-8 w-8"
			onclick={() => (showDeleteConfirm = true)}
		>
			<IconTrash class="h-4 w-4 text-destructive" />
		</Button>
	</div>

	<!-- Characters in Squad -->
	<div class="space-y-2">
		{#if squadCharacters.length === 0}
			<div class="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
				No characters in this squad yet
			</div>
		{:else}
			{#each squadCharacters as { character, account } (character.id)}
				<div class="flex items-center gap-2">
					<div class="flex-1">
						<CharacterCard
						{character}
						showAccount={true}
						accountName={account.name}
						disabled={true}
						class="pointer-events-none"
					/>
					</div>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 shrink-0"
						onclick={() => handleRemoveCharacter(character.id)}
					>
						<IconTrash class="h-4 w-4 text-destructive" />
					</Button>
				</div>
			{/each}
		{/if}

		{#if squad.characterIds.length < 10}
			<Button
				variant="outline"
				class="w-full"
				onclick={handleAddCharacter}
				disabled={appStore.accounts.length === 0}
			>
				<IconPlus class="mr-2 h-4 w-4" />
				Add Character
			</Button>
		{:else}
			<div class="text-center text-sm text-muted-foreground">Squad is full</div>
		{/if}
	</div>
</div>

<!-- Character Picker -->
<CharacterPicker
	bind:open={showPicker}
	onOpenChange={(open) => (showPicker = open)}
	{group}
	{squad}
	onSelect={handleSelectCharacter}
/>

<!-- Delete Confirmation Dialog -->
<Dialog open={showDeleteConfirm} onOpenChange={(open) => (showDeleteConfirm = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Delete Squad</DialogTitle>
			<DialogDescription>
				Are you sure you want to delete "{squad.name}"? This will remove all {squad
					.characterIds.length} character{squad.characterIds.length === 1 ? '' : 's'} from
				this squad. This action cannot be undone.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showDeleteConfirm = false)}>
				Cancel
			</Button>
			<Button variant="destructive" onclick={handleDelete}>Delete</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
