<script lang="ts">
    import type { Squad } from "$lib/types";
    import { appStore } from "$lib/stores/app.svelte";
    import { Button } from "$lib/components/ui/button";
    import {
        Dialog,
        DialogContent,
        DialogHeader,
        DialogTitle,
        DialogDescription,
        DialogFooter,
    } from "$lib/components/ui/dialog";
    import { IconTrash, IconArrowRight, IconUsers } from "@tabler/icons-svelte";

    interface Props {
        squad: Squad;
        onClick: () => void;
    }

    let { squad, onClick }: Props = $props();

    let showDeleteConfirm = $state(false);

    const squadCharacters = $derived(
        squad.characterIds
            .map((id) => appStore.findCharacterWithAccount(id))
            .filter((item): item is NonNullable<typeof item> => item !== null),
    );

    function handleDelete(e: Event) {
        e.stopPropagation();
        showDeleteConfirm = true;
    }

    function confirmDelete(groupId: string) {
        appStore.removeSquad(groupId, squad.id);
        showDeleteConfirm = false;
    }

    function getGroupId(): string {
        const groups = appStore.groups;
        for (const group of groups) {
            if (group.squads.some((s) => s.id === squad.id)) {
                return group.id;
            }
        }
        return "";
    }
</script>

<div
    class="group relative cursor-pointer rounded-lg border border-neutral-700 bg-card p-4 transition-all hover:border-neutral-500 hover:shadow-md"
    onclick={onClick}
    role="button"
    tabindex={0}
    onkeydown={(e) => e.key === "Enter" && onClick()}
>
    <!-- Delete Button -->
    <Button
        variant="ghost"
        size="icon"
        class="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
        onclick={handleDelete}
    >
        <IconTrash class="h-4 w-4 text-destructive" />
    </Button>

    <!-- Squad Header -->
    <div class="mb-3 pr-8">
        <h3 class="font-semibold">{squad.name}</h3>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <IconUsers class="h-3 w-3" />
            <span>{squad.characterIds.length}/10 postaci</span>
        </div>
    </div>

    <!-- Character Preview Grid -->
    {#if squadCharacters.length === 0}
        <div
            class="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground"
        >
            Pusty squad
        </div>
    {:else}
        <div class="mb-3 space-y-2">
            {#each squadCharacters.slice(0, 3) as { character } (character.id)}
                <div class="flex items-center gap-2">
                    <div
                        class="h-12 w-8 overflow-hidden rounded"
                        style={character.spriteUrl
                            ? `background-image: url('${character.spriteUrl}'); background-size: 400% 400%; background-position: 0% 0%;`
                            : "background-color: oklch(var(--muted));"}
                    ></div>
                    <div class="min-w-0 flex-1">
                        <div class="truncate font-medium text-xs">
                            {character.nick}
                        </div>
                        <div class="text-xs text-muted-foreground">
                            Lvl {character.lvl} • {character.profname}
                        </div>
                    </div>
                </div>
            {/each}
            {#if squadCharacters.length > 3}
                <div class="text-xs text-muted-foreground">
                    +{squadCharacters.length - 3} więcej
                </div>
            {/if}
        </div>
    {/if}
</div>

<!-- Delete Confirmation Dialog -->
<Dialog
    open={showDeleteConfirm}
    onOpenChange={(open) => (showDeleteConfirm = open)}
>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Usuń squad</DialogTitle>
            <DialogDescription>
                Czy na pewno chcesz usunąć "{squad.name}"? Spowoduje to usunięcie
                {squad.characterIds.length} postaci z tego squadu. Tej operacji
                nie można cofnąć.
            </DialogDescription>
        </DialogHeader>
        <DialogFooter>
            <Button
                variant="outline"
                onclick={() => (showDeleteConfirm = false)}
            >
                Anuluj
            </Button>
            <Button
                variant="destructive"
                onclick={() => confirmDelete(getGroupId())}
            >
                Usuń
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
