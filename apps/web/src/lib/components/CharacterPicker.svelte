<script lang="ts">
	import type { Squad, SquadGroup, CharacterFilters } from '$lib/types';
	import { appStore } from '$lib/stores/app.svelte';
	import {
		getAvailableCharacters,
		getWorlds,
		canAddCharacterToSquad,
	} from '$lib/utils/validation';

	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
	} from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import CharacterCard from './CharacterCard.svelte';
	import { IconSearch, IconX } from '@tabler/icons-svelte';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		group: SquadGroup;
		squad: Squad;
		onSelect: (characterId: string) => void;
	}

	let { open = $bindable(), onOpenChange, group, squad, onSelect }: Props = $props();

	let filters = $state<CharacterFilters>({});
	let searchQuery = $state('');

	const worlds = $derived(getWorlds(appStore.accounts));
	const availableCharacters = $derived(
		getAvailableCharacters(squad, group, appStore.accounts, filters)
	);

	function handleSearch(value: string) {
		searchQuery = value;
		filters = { ...filters, search: value || undefined };
	}

	function handleWorldChange(value: string) {
		filters = { ...filters, world: value || undefined };
	}

	function handleProfessionChange(prof: string) {
		filters = {
			...filters,
			profession: filters.profession === prof ? undefined : prof,
		};
	}

	function clearFilters() {
		filters = {};
		searchQuery = '';
	}

	function handleSelect(characterId: string) {
		onSelect(characterId);
		onOpenChange(false);
		clearFilters();
	}

	const professions = [
		{ code: 'w', name: 'Wojownik', color: '#ef4444' },
		{ code: 't', name: 'Tropiciel', color: '#22c55e' },
		{ code: 'h', name: 'Łowca', color: '#f97316' },
		{ code: 'p', name: 'Paladyn', color: '#3b82f6' },
		{ code: 'm', name: 'Mag', color: '#8b5cf6' },
		{ code: 'k', name: 'Tancerz Ostrzy', color: '#06b6d4' },
	];
</script>

<Dialog {open} onOpenChange={onOpenChange}>
	<DialogContent class="max-h-[90vh] max-w-4xl">
		<DialogHeader>
			<DialogTitle>Add Character to Squad</DialogTitle>
		</DialogHeader>

		<div class="flex flex-col gap-4 py-4">
			<!-- Filters -->
			<div class="flex flex-col gap-3">
				<div class="flex gap-2">
					<div class="relative flex-1">
<IconSearch
						class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
					/>
						<Input
							placeholder="Search by name..."
							value={searchQuery}
							oninput={(e) => handleSearch(e.currentTarget.value)}
							class="pl-10"
						/>
					</div>
					<Select
						type="single"
						value={filters.world}
						onValueChange={handleWorldChange}
					>
					<SelectTrigger class="w-[140px]">
						{filters.world || 'All Worlds'}
					</SelectTrigger>
						<SelectContent>
							<SelectItem value={''}>All Worlds</SelectItem>
							{#each worlds as world}
								<SelectItem value={world}>{world}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
					{#if filters.search || filters.world || filters.profession}
						<Button variant="outline" size="icon" onclick={clearFilters}>
							<IconX class="h-4 w-4" />
						</Button>
					{/if}
				</div>

				<!-- Profession filters -->
				<div class="flex flex-wrap gap-1">
					{#each professions as prof}
						<Button
							variant={filters.profession === prof.code ? 'default' : 'outline'}
							size="sm"
							class="text-xs"
							style={filters.profession === prof.code
								? ''
								: `border-color: ${prof.color}; color: ${prof.color};`}
							onclick={() => handleProfessionChange(prof.code)}
						>
							{prof.name}
						</Button>
					{/each}
				</div>

				<div class="text-sm text-muted-foreground">
					{availableCharacters.length} character{availableCharacters.length === 1
						? ''
						: 's'} available
					{#if squad.characterIds.length > 0}
						<span class="text-muted-foreground/70">
							({squad.characterIds.length}/10 in squad)
						</span>
					{/if}
				</div>
			</div>

			<!-- Character Grid -->
			<ScrollArea class="h-[400px]">
				{#if availableCharacters.length === 0}
					<div class="flex h-full items-center justify-center text-muted-foreground">
						No characters available with current filters
					</div>
				{:else}
					<div class="grid gap-2 pr-4">
						{#each availableCharacters as character (character.id)}
							{@const result = canAddCharacterToSquad(
								character.id,
								squad,
								group,
								appStore.accounts
							)}
							<CharacterCard
								{character}
								disabled={!result.valid}
								onClick={() => result.valid && handleSelect(character.id)}
								showAccount={true}
								accountName={appStore.accounts.find((a) =>
									a.characters.some((c) => c.id === character.id)
								)?.name}
							/>
						{/each}
					</div>
				{/if}
			</ScrollArea>
		</div>
	</DialogContent>
</Dialog>
