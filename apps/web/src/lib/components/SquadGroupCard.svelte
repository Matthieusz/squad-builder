<script lang="ts">
	import type { SquadGroup } from '$lib/types';
	import { appStore } from '$lib/stores/app.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
	} from '$lib/components/ui/dialog';
	import { IconUsers, IconTrash, IconChevronRight } from '@tabler/icons-svelte';

	interface Props {
		group: SquadGroup;
		onClick: () => void;
	}

	let { group, onClick }: Props = $props();

	let showDeleteConfirm = $state(false);

	const totalCharacters = $derived(
		group.squads.reduce((sum, squad) => sum + squad.characterIds.length, 0)
	);

	const totalSlots = $derived(group.squads.length * 10);

	function handleDelete(e: Event) {
		e.stopPropagation();
		showDeleteConfirm = true;
	}

	function confirmDelete() {
		appStore.removeGroup(group.id);
		showDeleteConfirm = false;
	}
</script>

<Card
	class="cursor-pointer transition-all hover:border-primary/50"
	onclick={onClick}
	role="button"
	tabindex={0}
	onkeydown={(e) => e.key === 'Enter' && onClick()}
>
	<CardHeader class="pb-2">
		<div class="flex items-start justify-between">
			<div>
				<CardTitle class="text-lg">{group.name}</CardTitle>
				<div class="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
					<span>{group.squads.length} squad{group.squads.length === 1 ? '' : 's'}</span>
					<span>•</span>
					<span>
						<IconUsers class="mr-1 inline h-3 w-3" />
						{totalCharacters}/{totalSlots} characters
					</span>
				</div>
			</div>
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-8 -mr-2"
				onclick={handleDelete}
			>
				<IconTrash class="h-4 w-4 text-destructive" />
			</Button>
		</div>
	</CardHeader>
	<CardContent>
		<div class="flex items-center justify-between">
			<div class="flex -space-x-2">
				{#each group.squads.slice(0, 3) as squad}
					{#each squad.characterIds.slice(0, 1) as charId}
						{@const char = appStore.findCharacter(charId)}
						{#if char}
							<div
								class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted"
							>
								<img
									src={char.spriteUrl}
									alt={char.nick}
									class="h-full w-full object-contain"
								/>
							</div>
						{/if}
					{/each}
				{/each}
				{#if group.squads.length > 3}
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs"
					>
						+{group.squads.length - 3}
					</div>
				{/if}
			</div>
			<IconChevronRight class="h-5 w-5 text-muted-foreground" />
		</div>
	</CardContent>
</Card>

<!-- Delete Confirmation Dialog -->
<Dialog open={showDeleteConfirm} onOpenChange={(open) => (showDeleteConfirm = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Delete Group</DialogTitle>
			<DialogDescription>
				Are you sure you want to delete "{group.name}"? This will remove all {group.squads
					.length} squad{group.squads.length === 1 ? '' : 's'} and {totalCharacters} character{totalCharacters ===
				1
					? ''
					: 's'}. This action cannot be undone.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showDeleteConfirm = false)}>
				Cancel
			</Button>
			<Button variant="destructive" onclick={confirmDelete}>Delete</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
