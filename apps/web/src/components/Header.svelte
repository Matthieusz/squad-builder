<script lang="ts">
    import ModeToggle from "$lib/components/ModeToggle.svelte";

    const links = [{ to: "/", label: "Dashboard" }];
</script>

<div>
    <div class="flex flex-row items-center justify-between px-4 py-2 md:px-6">
        <nav class="flex gap-4 text-lg">
            {#each links as link (link.to)}
                <a href={link.to} class="transition-colors hover:text-primary">
                    {link.label}
                </a>
            {/each}
        </nav>
        <div class="flex items-center gap-2">
            <ModeToggle />
        </div>
    </div>
    <hr class="border-border" />
</div>
