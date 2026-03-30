<script lang="ts">
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
	import { validateGroupName } from '$lib/utils/validation';
	import { IconPlus, IconFolder } from '@tabler/icons-svelte';
	import SquadGroupCard from './SquadGroupCard.svelte';

	interface Props {
		onGroupClick: (groupId: string) => void;
	}

	let { onGroupClick }: Props = $props();

	let showCreateDialog = $state(false);
	let newGroupName = $state('');
	let validationErrors = $state<string[]>([]);

	function openCreateDialog() {
		newGroupName = '';
		validationErrors = [];
		showCreateDialog = true;
	}

	function handleCreate() {
		const errors = validateGroupName(newGroupName);
		if (errors.length > 0) {
			validationErrors = errors.map((e) => e.message);
			return;
		}

		// Check for duplicate name
		const existing = appStore.groups.find(
			(g) => g.name.toLowerCase() === newGroupName.toLowerCase()
		);
		if (existing) {
			validationErrors = ['Grupa o tej nazwie już istnieje'];
			return;
		}

		const id = appStore.addGroup(newGroupName);
		showCreateDialog = false;
		newGroupName = '';
		validationErrors = [];
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">Grupy squadów</h2>
		<Button onclick={openCreateDialog} size="sm">
			<IconPlus class="mr-2 h-4 w-4" />
			Utwórz grupę
		</Button>
	</div>

	{#if appStore.groups.length === 0}
		<div class="rounded-lg border border-dashed p-8 text-center">
			<IconFolder class="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
			<p class="text-sm text-muted-foreground">Nie utworzono jeszcze żadnych grup.</p>
			<p class="text-xs text-muted-foreground/70">
				Kliknij „Utwórz grupę", aby rozpocząć tworzenie squadów.
			</p>
		</div>
	{:else}
		<div class="grid gap-3">
			{#each appStore.groups as group (group.id)}
				<SquadGroupCard {group} onClick={() => onGroupClick(group.id)} />
			{/each}
		</div>
	{/if}
</div>

<!-- Create Group Dialog -->
<Dialog open={showCreateDialog} onOpenChange={(open) => (showCreateDialog = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Utwórz nową grupę</DialogTitle>
		</DialogHeader>

		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<label for="group-name" class="text-sm font-medium">Nazwa grupy</label>
			<Input
				id="group-name"
				bind:value={newGroupName}
				placeholder="np. Event 1"
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
			<Button variant="outline" onclick={() => (showCreateDialog = false)}>
				Anuluj
			</Button>
			<Button onclick={handleCreate} disabled={!newGroupName.trim()}>
				Utwórz
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
