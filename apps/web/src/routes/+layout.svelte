<script lang="ts">
	import "../app.css";
	import { ModeWatcher } from "mode-watcher";
	import ModeToggle from "$lib/components/ModeToggle.svelte";
	import ExportImport from "$lib/components/ExportImport.svelte";
	import { IconUsers } from "@tabler/icons-svelte";

	const { children } = $props();
</script>

<div class="min-h-svh">
	<ModeWatcher />
	
	<!-- Fixed Top Bar -->
	<div
		class="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur"
	>
		<a
			href="/"
			class="flex items-center gap-2 text-lg font-bold hover:text-primary"
		>
			<IconUsers class="h-5 w-5" />
			<span>Kreator Drużyn Margonem</span>
		</a>
		<div class="flex items-center gap-2">
			<ExportImport />
			<ModeToggle />
		</div>
	</div>

	<!-- Main Content -->
	<main class="h-svh pt-14">
		{@render children()}
	</main>
</div>
