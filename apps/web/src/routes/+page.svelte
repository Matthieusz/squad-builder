<script lang="ts">
	import { goto } from '$app/navigation';
	import AccountImporter from '$lib/components/AccountImporter.svelte';
	import AccountList from '$lib/components/AccountList.svelte';
	import SquadGroupList from '$lib/components/SquadGroupList.svelte';

	let showImporter = $state(false);

	function handleGroupClick(groupId: string) {
		goto(`/group/${groupId}`);
	}
</script>

<div class="container mx-auto max-w-7xl p-4">
	<!-- Main Content -->
	<div class="grid gap-6 lg:grid-cols-[320px_1fr]">
		<!-- Left Column - Accounts -->
		<aside class="lg:top-24 lg:sticky lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
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
