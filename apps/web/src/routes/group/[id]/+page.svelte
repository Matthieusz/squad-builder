<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { appStore } from '$lib/stores/app.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogFooter,
	} from '$lib/components/ui/dialog';
	import { validateSquadName } from '$lib/utils/validation';
	import SquadCard from '$lib/components/SquadCard.svelte';
	import { IconArrowLeft, IconPlus, IconArrowRight } from '@tabler/icons-svelte';

	const groupId = $derived(page.params.id ?? '');
	const group = $derived(groupId ? appStore.getGroup(groupId) : undefined);

	let showCreateSquad = $state(false);
	let newSquadName = $state('');
	let validationErrors = $state<string[]>([]);

	const totalCharacters = $derived(
		group?.squads.reduce((sum, squad) => sum + squad.characterIds.length, 0) ?? 0
	);

	function goBack() {
		goto('/');
	}

	function openCreateSquad() {
		newSquadName = '';
		validationErrors = [];
		showCreateSquad = true;
	}

	function handleCreateSquad() {
		const errors = validateSquadName(newSquadName);
		if (errors.length > 0) {
			validationErrors = errors.map((e) => e.message);
			return;
		}

		const existing = group?.squads.find(
			(s) => s.name.toLowerCase() === newSquadName.toLowerCase()
		);
		if (existing) {
			validationErrors = ['A squad with this name already exists in this group'];
			return;
		}

		if (group) {
			appStore.addSquad(group.id, newSquadName);
			showCreateSquad = false;
			newSquadName = '';
			validationErrors = [];
		}
	}

	function handleSquadClick(squadId: string) {
		goto(`/group/${groupId}/squad/${squadId}`);
	}
</script>

<svelte:head>
	<title>{group ? `${group.name} - Squad Builder` : 'Group Not Found'}</title>
</svelte:head>

{#if !group}
	<div class="flex h-full items-center justify-center p-4">
		<div class="rounded-lg border border-dashed p-8 text-center">
			<h1 class="mb-2 text-xl font-semibold">Group Not Found</h1>
			<p class="mb-4 text-sm text-muted-foreground">
				The group you're looking for doesn't exist or has been deleted.
			</p>
			<Button onclick={goBack}>
				<IconArrowLeft class="mr-2 h-4 w-4" />
				Go Back
			</Button>
		</div>
	</div>
{:else}
	<div class="container mx-auto max-w-5xl p-4">
		<!-- Header -->
		<div class="mb-6">
			<Button variant="ghost" class="mb-4 -ml-4" onclick={goBack}>
				<IconArrowLeft class="mr-2 h-4 w-4" />
				All Groups
			</Button>

			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 class="text-2xl font-bold">{group.name}</h1>
					<div class="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
						<span>{group.squads.length} squad{group.squads.length === 1 ? '' : 's'}</span>
						<span>•</span>
						<span>{totalCharacters} character{totalCharacters === 1 ? '' : 's'}</span>
					</div>
				</div>
				<Button onclick={openCreateSquad}>
					<IconPlus class="mr-2 h-4 w-4" />
					New Squad
				</Button>
			</div>
		</div>

		<!-- Squads Grid -->
		{#if group.squads.length === 0}
			<div class="rounded-lg border border-dashed p-12 text-center">
				<p class="text-muted-foreground">No squads in this group yet.</p>
				<p class="mt-1 text-sm text-muted-foreground/70">
					Click "New Squad" to create your first squad.
				</p>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2">
				{#each group.squads as squad (squad.id)}
					<SquadCard {squad} onClick={() => handleSquadClick(squad.id)} />
				{/each}
			</div>
		{/if}
	</div>
{/if}

<!-- Create Squad Dialog -->
<Dialog open={showCreateSquad} onOpenChange={(open) => (showCreateSquad = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Create New Squad</DialogTitle>
		</DialogHeader>

		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<label for="squad-name" class="text-sm font-medium">Squad Name</label>
				<Input
					id="squad-name"
					bind:value={newSquadName}
					placeholder="e.g., Main Squad"
				/>
				{#if validationErrors.length > 0}
					<div class="space-y-1">
						{#each validationErrors as error}
							<p class="text-sm text-destructive">{error}</p>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={() => (showCreateSquad = false)}>
				Cancel
			</Button>
			<Button onclick={handleCreateSquad} disabled={!newSquadName.trim()}>
				Create
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
