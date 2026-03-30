<script lang="ts">
	import { goto } from '$app/navigation';
	import AccountImporter from '$lib/components/AccountImporter.svelte';
	import AccountList from '$lib/components/AccountList.svelte';
	import SquadGroupList from '$lib/components/SquadGroupList.svelte';
	import ExportImport from '$lib/components/ExportImport.svelte';

	let showImporter = $state(false);

	function handleGroupClick(groupId: string) {
		goto(`/group/${groupId}`);
	}
</script>

<svelte:head>
	<title>Margonem Squad Builder</title>
</svelte:head>

<div class="container mx-auto max-w-7xl p-4">
	<!-- Header -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold">Margonem Squad Builder</h1>
			<p class="text-sm text-muted-foreground">
				Create and manage character squads for your adventures
			</p>
		</div>
		<ExportImport />
	</div>

	<!-- Main Content -->
	<div class="grid gap-6 lg:grid-cols-[350px_1fr]">
		<!-- Left Column - Accounts -->
		<aside>
			<AccountList onAddAccount={() => (showImporter = true)} />
		</aside>

		<!-- Right Column - Squad Groups -->
		<main>
			<SquadGroupList onGroupClick={handleGroupClick} />
		</main>
	</div>
</div>

<!-- Account Importer Dialog -->
<AccountImporter
	bind:open={showImporter}
	onOpenChange={(open) => (showImporter = open)}
/>
