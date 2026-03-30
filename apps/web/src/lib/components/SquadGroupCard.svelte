<script lang="ts">
    import type { SquadGroup } from "$lib/types";
    import { appStore } from "$lib/stores/app.svelte";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import {
        Dialog,
        DialogContent,
        DialogHeader,
        DialogTitle,
        DialogDescription,
        DialogFooter,
    } from "$lib/components/ui/dialog";
    import {
        IconUsers,
        IconTrash,
        IconChevronRight,
    } from "@tabler/icons-svelte";

    interface Props {
        group: SquadGroup;
        onClick: () => void;
    }

    let { group, onClick }: Props = $props();

    let showDeleteConfirm = $state(false);

    const totalCharacters = $derived(
        group.squads.reduce((sum, squad) => sum + squad.characterIds.length, 0),
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
    class="cursor-pointer transition-all hover:border-primary-foreground/50"
    onclick={onClick}
    role="button"
    tabindex={0}
    onkeydown={(e) => e.key === "Enter" && onClick()}
>
    <CardHeader class="pb-2">
        <div class="flex items-start justify-between">
            <div>
                <CardTitle class="text-lg">{group.name}</CardTitle>
                <div
                    class="mt-1 flex items-center gap-2 text-sm text-muted-foreground"
                >
                    <span
                        >{group.squads.length} squad{group.squads.length === 1
                            ? ""
                            : "ów"}</span
                    >
                    <span>•</span>
                    <span>
                        <IconUsers class="mr-1 inline h-3 w-3" />
                        {totalCharacters}/{totalSlots} postaci
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
</Card>

<!-- Delete Confirmation Dialog -->
<Dialog
    open={showDeleteConfirm}
    onOpenChange={(open) => (showDeleteConfirm = open)}
>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Usuń grupę</DialogTitle>
            <DialogDescription>
                Czy na pewno chcesz usunąć "{group.name}"? Spowoduje to usunięcie
                {group.squads.length} squad{group.squads.length === 1
                    ? "u"
                    : "ów"} i {totalCharacters} postaci. Tej operacji nie można
                cofnąć.
            </DialogDescription>
        </DialogHeader>
        <DialogFooter>
            <Button
                variant="outline"
                onclick={() => (showDeleteConfirm = false)}
            >
                Anuluj
            </Button>
            <Button variant="destructive" onclick={confirmDelete}>Usuń</Button
            >
        </DialogFooter>
    </DialogContent>
</Dialog>
