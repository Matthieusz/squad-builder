<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { appStore } from "$lib/stores/app.svelte";
    import { getProfessionStyle } from "$lib/utils/profession";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import CharacterCard from "$lib/components/CharacterCard.svelte";
    import CharacterPickerPanel from "$lib/components/CharacterPickerPanel.svelte";
    import { IconArrowLeft, IconX, IconUsers } from "@tabler/icons-svelte";

    const groupId = $derived(page.params.id ?? "");
    const squadId = $derived(page.params.squadId ?? "");
    const group = $derived(groupId ? appStore.getGroup(groupId) : undefined);
    const squad = $derived(group?.squads.find((s) => s.id === squadId));

    const squadCharacters = $derived(
        squad?.characterIds
            .map((id) => appStore.findCharacterWithAccount(id))
            .filter(
                (item): item is NonNullable<typeof item> => item !== null,
            ) ?? [],
    );

    const minLevel = $derived(
        squadCharacters.length > 0
            ? Math.min(...squadCharacters.map(({ character }) => character.lvl))
            : 0,
    );

    const maxLevel = $derived(
        squadCharacters.length > 0
            ? Math.max(...squadCharacters.map(({ character }) => character.lvl))
            : 0,
    );

    const professionsPresent = $derived([
        ...new Set(squadCharacters.map(({ character }) => character.prof)),
    ]);

    function goBack() {
        goto(`/group/${groupId}`);
    }

    function handleAddCharacter(characterId: string) {
        if (group && squad) {
            appStore.addCharacterToSquad(group.id, squad.id, characterId);
        }
    }

    function handleRemoveCharacter(characterId: string) {
        if (group && squad) {
            appStore.removeCharacterFromSquad(group.id, squad.id, characterId);
        }
    }
</script>

<svelte:head>
    <title>
        {squad
            ? `${squad.name} - ${group?.name ?? ""} - Kreator Drużyn`
            : "Nie znaleziono drużyny"}
    </title>
</svelte:head>

{#if !group || !squad}
    <div class="flex h-full items-center justify-center p-4">
        <div class="rounded-lg border border-dashed p-8 text-center">
            <h1 class="mb-2 text-xl font-semibold">Nie znaleziono drużyny</h1>
            <p class="mb-4 text-sm text-muted-foreground">
                Drużyna, którą próbujesz znaleźć, nie istnieje lub została
                usunięta.
            </p>
            <Button onclick={goBack}>
                <IconArrowLeft class="mr-2 h-4 w-4" />
                Wróć
            </Button>
        </div>
    </div>
{:else}
    <div class="flex h-full">
        <!-- Left Panel - Character Picker -->
        <div class="flex h-full w-80 shrink-0 flex-col border-r bg-muted/30">
            <div class="flex items-center gap-2 border-b p-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onclick={goBack}
                    class="shrink-0"
                >
                    <IconArrowLeft class="h-4 w-4" />
                </Button>
                <div class="min-w-0 flex-1">
                    <h2 class="truncate font-semibold">{squad.name}</h2>
                    <p class="text-xs text-muted-foreground">
                        {squad.characterIds.length}/10 postaci
                    </p>
                </div>
            </div>

            {#if squad.characterIds.length < 10}
                <div class="flex-1 overflow-hidden">
                    <CharacterPickerPanel
                        {group}
                        {squad}
                        onSelect={handleAddCharacter}
                        class="h-full"
                    />
                </div>
            {:else}
                <div
                    class="flex flex-1 items-center justify-center text-muted-foreground"
                >
                    Drużyna jest pełna
                </div>
            {/if}
        </div>

        <!-- Right Panel - Squad Roster -->
        <div class="flex flex-1 flex-col overflow-hidden">
            <div class="border-b p-4">
                <div class="mb-3 flex items-start justify-between">
                    <div>
                        <h1 class="text-xl font-bold">{squad.name}</h1>
                        <p class="text-sm text-muted-foreground">
                            {group.name} • {squad.characterIds.length} postaci
                        </p>
                    </div>
                    <Button variant="ghost" onclick={goBack}>
                        <IconArrowLeft class="mr-2 h-4 w-4" />
                        Wróć do {group.name}
                    </Button>
                </div>

                <!-- Squad Summary -->
                {#if squadCharacters.length > 0}
                    <div class="flex flex-wrap items-center gap-3 text-sm">
                        <div class="flex items-center gap-1">
                            <IconUsers class="h-4 w-4 text-muted-foreground" />
                            <span class="text-muted-foreground">Poziomy:</span>
                            <span class="font-medium"
                                >{minLevel} - {maxLevel}</span
                            >
                        </div>
                        <div class="flex items-center gap-1">
                            <span class="text-muted-foreground">Profesje:</span>
                            <div class="flex flex-wrap gap-1">
                                {#each professionsPresent as prof}
                                    {@const style = getProfessionStyle(prof)}
                                    <Badge
                                        variant="outline"
                                        class="text-xs"
                                        style="border-color: {style.color}; color: {style.color};"
                                    >
                                        {style.name}
                                    </Badge>
                                {/each}
                            </div>
                        </div>
                    </div>
                {/if}
            </div>

            <ScrollArea class="flex-1 p-4">
                {#if squadCharacters.length === 0}
                    <div
                        class="flex h-full items-center justify-center text-muted-foreground"
                    >
                        <div class="text-center">
                            <p class="mb-2">Brak postaci w tej drużynie</p>
                            <p class="text-sm">
                                Wybierz postacie z lewego panelu, aby dodać je
                                do drużyny
                            </p>
                        </div>
                    </div>
                {:else}
                    <!-- 2x5 Grid -->
                    <div class="grid grid-cols-2 gap-3 lg:grid-cols-5">
                        {#each squadCharacters as { character, account } (character.id)}
                            <div class="group relative">
                                <CharacterCard
                                    size="md"
                                    {character}
                                    showAccount={true}
                                    accountName={account.name}
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    class="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                    onclick={() =>
                                        handleRemoveCharacter(character.id)}
                                >
                                    <IconX class="h-3 w-3" />
                                </Button>
                            </div>
                        {/each}
                    </div>
                {/if}
            </ScrollArea>
        </div>
    </div>
{/if}
