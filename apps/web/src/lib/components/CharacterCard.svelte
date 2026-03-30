<script lang="ts">
	import type { Character } from '$lib/types';
	import { getProfessionStyle } from '$lib/utils/profession';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';

	interface Props {
		character: Character;
		showAccount?: boolean;
		accountName?: string;
		selected?: boolean;
		disabled?: boolean;
		onClick?: () => void;
		class?: string;
	}

	let {
		character,
		showAccount = false,
		accountName = '',
		selected = false,
		disabled = false,
		onClick,
		class: className = '',
	}: Props = $props();

	const profStyle = $derived(getProfessionStyle(character.prof));
</script>

<button
	type="button"
	class={cn(
		'relative flex flex-col gap-2 rounded-lg border p-3 transition-all',
		selected
			? 'border-primary bg-primary/10'
			: 'border-border bg-card hover:border-primary/50',
		disabled && 'cursor-not-allowed opacity-50',
		className
	)}
	disabled={disabled}
	onclick={onClick}
>
	<div class="flex items-center gap-3">
		<!-- Character Sprite -->
		<div
			class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md bg-muted"
		>
			{#if character.spriteUrl}
				<img
					src={character.spriteUrl}
					alt={character.nick}
					class="h-full w-full object-contain"
				/>
			{:else}
				<span class="text-xs text-muted-foreground">No image</span>
			{/if}
		</div>

		<div class="flex flex-col gap-1 text-left">
			<!-- Character Name -->
			<div class="font-semibold text-card-foreground">{character.nick}</div>

			<!-- Level and Profession -->
			<div class="flex items-center gap-2 text-sm">
				<span class="text-muted-foreground">Lvl {character.lvl}</span>
				<Badge
					variant="outline"
					style="border-color: {profStyle.color}; color: {profStyle.color};"
				>
					{character.profname}
				</Badge>
			</div>

			<!-- World -->
			<div class="text-xs text-muted-foreground">
				{character.world}
				{#if character.clan}
					<span class="text-muted-foreground/70">• {character.clan}</span>
				{/if}
			</div>
		</div>
	</div>

	{#if showAccount && accountName}
		<div class="mt-1 text-xs text-muted-foreground/60">
			Account: {accountName}
		</div>
	{/if}

	{#if selected}
		<div
			class="absolute right-2 top-2 h-3 w-3 rounded-full bg-primary"
		></div>
	{/if}
</button>
