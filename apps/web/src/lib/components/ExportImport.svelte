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
	let showClearAccountsConfirm = $state(false);
	let showClearGroupsConfirm = $state(false);
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
				err instanceof Error ? err.message : 'Nie udało się zaimportować dane';
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

	function confirmClearAccounts() {
		appStore.clearAccounts();
		showClearAccountsConfirm = false;
	}

	function confirmClearGroups() {
		appStore.clearGroups();
		showClearGroupsConfirm = false;
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
		Eksportuj
	</Button>

	<Button variant="outline" size="sm" onclick={handleImportClick}>
		<IconUpload class="mr-2 h-4 w-4" />
		Importuj
	</Button>

	{#if appStore.accounts.length > 0}
		<Button variant="outline" size="sm" onclick={() => (showClearAccountsConfirm = true)}>
			<IconTrash class="mr-2 h-4 w-4" />
			Usuń konta
		</Button>
	{/if}

	{#if appStore.groups.length > 0}
		<Button variant="outline" size="sm" onclick={() => (showClearGroupsConfirm = true)}>
			<IconTrash class="mr-2 h-4 w-4" />
			Usuń grupy
		</Button>
	{/if}

	<Button variant="destructive" size="sm" onclick={handleClear}>
		<IconTrash class="mr-2 h-4 w-4" />
		Wyczyść wszystko
	</Button>
</div>

{#if showImportError}
	<Alert variant="destructive" class="mt-2">
		<IconAlertCircle class="h-4 w-4" />
		<AlertDescription>{importErrorMessage}</AlertDescription>
	</Alert>
{/if}

<!-- Clear Accounts Dialog -->
<Dialog open={showClearAccountsConfirm} onOpenChange={(open) => (showClearAccountsConfirm = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Usuń wszystkie konta</DialogTitle>
			<DialogDescription>
				Czy na pewno chcesz usunąć wszystkie {appStore.accounts.length} kont{appStore.accounts.length === 1 ? 'o' : 'a'}? Postacie zostaną usunięte ze składów. Grupy pozostaną. Tej operacji nie można cofnąć.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showClearAccountsConfirm = false)}>
				Anuluj
			</Button>
			<Button variant="destructive" onclick={confirmClearAccounts}>Usuń konta</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<!-- Clear Groups Dialog -->
<Dialog open={showClearGroupsConfirm} onOpenChange={(open) => (showClearGroupsConfirm = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Usuń wszystkie grupy</DialogTitle>
			<DialogDescription>
				Czy na pewno chcesz usunąć wszystkie {appStore.groups.length} grup{appStore.groups.length === 1 ? 'ę' : 'y'}? Konta pozostaną. Tej operacji nie można cofnąć.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showClearGroupsConfirm = false)}>
				Anuluj
			</Button>
			<Button variant="destructive" onclick={confirmClearGroups}>Usuń grupy</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<!-- Clear All Dialog -->
<Dialog open={showClearConfirm} onOpenChange={(open) => (showClearConfirm = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Wyczyść wszystkie dane</DialogTitle>
			<DialogDescription>
				Czy na pewno chcesz usunąć wszystkie dane? Spowoduje to usunięcie {appStore.accounts
					.length} kont{appStore.accounts.length === 1 ? 'a' : ''} i {appStore.groups
					.length} grup{appStore.groups.length === 1 ? 'y' : ''}. Tej operacji nie można cofnąć.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showClearConfirm = false)}>
				Anuluj
			</Button>
			<Button variant="destructive" onclick={confirmClear}>Wyczyść wszystko</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
