<script lang="ts">
	import { appStore } from '$lib/stores/app.svelte';
	import { exportToFile, importFromFile } from '$lib/utils/export';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
	} from '$lib/components/ui/dialog';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { IconDownload, IconUpload, IconTrash, IconAlertCircle } from '@tabler/icons-svelte';

	let showClearConfirm = $state(false);
	let showImportError = $state(false);
	let importErrorMessage = $state('');
	let fileInput: HTMLInputElement | null = $state(null);

	function handleExport() {
		const data = appStore.exportData();
		exportToFile(data);
	}

	function handleImportClick() {
		fileInput?.click();
	}

	async function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		try {
			const data = await importFromFile(file);
			appStore.importData(data);
			showImportError = false;
			importErrorMessage = '';
		} catch (err) {
			showImportError = true;
			importErrorMessage =
				err instanceof Error ? err.message : 'Failed to import data';
		}

		// Reset file input
		if (fileInput) {
			fileInput.value = '';
		}
	}

	function handleClear() {
		showClearConfirm = true;
	}

	function confirmClear() {
		appStore.clearAll();
		showClearConfirm = false;
	}
</script>

<div class="flex items-center gap-2">
	<input
		type="file"
		accept=".json"
		bind:this={fileInput}
		onchange={handleFileSelect}
		class="hidden"
	/>

	<Button variant="outline" size="sm" onclick={handleExport}>
		<IconDownload class="mr-2 h-4 w-4" />
		Export
	</Button>

	<Button variant="outline" size="sm" onclick={handleImportClick}>
		<IconUpload class="mr-2 h-4 w-4" />
		Import
	</Button>

	<Button variant="destructive" size="sm" onclick={handleClear}>
		<IconTrash class="mr-2 h-4 w-4" />
		Clear All
	</Button>
</div>

{#if showImportError}
	<Alert variant="destructive" class="mt-2">
		<IconAlertCircle class="h-4 w-4" />
		<AlertDescription>{importErrorMessage}</AlertDescription>
	</Alert>
{/if}

<!-- Clear Confirmation Dialog -->
<Dialog open={showClearConfirm} onOpenChange={(open) => (showClearConfirm = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Clear All Data</DialogTitle>
			<DialogDescription>
				Are you sure you want to delete all data? This will remove all {appStore.accounts
					.length} account{appStore.accounts.length === 1 ? '' : 's'} and {appStore.groups
					.length} group{appStore.groups.length === 1 ? '' : 's'}. This action cannot be undone.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showClearConfirm = false)}>
				Cancel
			</Button>
			<Button variant="destructive" onclick={confirmClear}>Clear All</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
