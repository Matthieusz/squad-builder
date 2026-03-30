<script lang="ts">
    import type { Squad, SquadGroup, CharacterFilters } from "$lib/types";
    import { appStore } from "$lib/stores/app.svelte";
    import {
        getAvailableCharacters,
        getWorlds,
        canAddCharacterToSquad,
    } from "$lib/utils/validation";

    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
    } from "$lib/components/ui/select";
    import CharacterCard from "./CharacterCard.svelte";
    import { IconSearch, IconX } from "@tabler/icons-svelte";

    interface Props {
        group: SquadGroup;
        squad: Squad;
        onSelect: (characterId: string) => void;
        class?: string;
    }

    let { group, squad, onSelect, class: className = "" }: Props = $props();

    let filters = $state<CharacterFilters>({});
    let searchQuery = $state("");
    let minLevel = $state("");
    let maxLevel = $state("");

    const worlds = $derived(getWorlds(appStore.accounts));
    const availableCharacters = $derived(
        getAvailableCharacters(squad, group, appStore.accounts, filters),
    );

    function handleSearch(value: string) {
        searchQuery = value;
        filters = { ...filters, search: value || undefined };
    }

    function handleWorldChange(value: string) {
        filters = { ...filters, world: value || undefined };
    }

    function handleProfessionChange(prof: string) {
        filters = {
            ...filters,
            profession: filters.profession === prof ? undefined : prof,
        };
    }

    function handleMinLevelChange(value: string) {
        minLevel = value;
        const num = parseInt(value, 10);
        filters = { ...filters, minLevel: isNaN(num) ? undefined : num };
    }

    function handleMaxLevelChange(value: string) {
        maxLevel = value;
        const num = parseInt(value, 10);
        filters = { ...filters, maxLevel: isNaN(num) ? undefined : num };
    }

    function clearFilters() {
        filters = {};
        searchQuery = "";
        minLevel = "";
        maxLevel = "";
    }

    function handleSelect(characterId: string) {
        onSelect(characterId);
    }

    const professions = [
        { code: "w", name: "Woj", color: "#ef4444" },
        { code: "t", name: "Trop", color: "#22c55e" },
        { code: "h", name: "Łow", color: "#f97316" },
        { code: "p", name: "Pal", color: "#3b82f6" },
        { code: "m", name: "Mag", color: "#8b5cf6" },
        { code: "k", name: "TO", color: "#06b6d4" },
    ];
</script>

<div class={`flex flex-col gap-4 ${className}`}>
    <!-- Filters -->
    <div class="flex flex-col gap-3">
        <div class=" m-1 flex gap-2">
            <div class="relative flex-1">
                <IconSearch
                    class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    placeholder="Szukaj..."
                    value={searchQuery}
                    oninput={(e) => handleSearch(e.currentTarget.value)}
                    class="pl-10"
                />
            </div>
            <Select
                type="single"
                value={filters.world}
                onValueChange={handleWorldChange}
            >
                <SelectTrigger class="w-30">
                    {filters.world || "Świat"}
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={""}>Wszystkie światy</SelectItem>
                    {#each worlds as world}
                        <SelectItem value={world}>{world}</SelectItem>
                    {/each}
                </SelectContent>
            </Select>
            {#if filters.search || filters.world || filters.profession}
                <Button variant="outline" size="icon" onclick={clearFilters}>
                    <IconX class="h-4 w-4" />
                </Button>
            {/if}
        </div>

        <!-- Level Range filters -->
        <div class="flex items-center gap-2 w-full">
            <span class="text-xs text-muted-foreground ml-2">Poziom:</span>
            <Input
                type="number"
                placeholder="Min"
                value={minLevel}
                oninput={(e) => handleMinLevelChange(e.currentTarget.value)}
                class="h-8 w-30 text-xs"
                min={0}
            />
            <span class="text-xs text-muted-foreground">-</span>
            <Input
                type="number"
                placeholder="Max"
                value={maxLevel}
                oninput={(e) => handleMaxLevelChange(e.currentTarget.value)}
                class="h-8 w-30 text-xs"
                min={0}
            />
        </div>

        <!-- Profession filters -->
        <div class="flex flex-wrap gap-1 ml-2">
            {#each professions as prof}
                <Button
                    variant={filters.profession === prof.code
                        ? "default"
                        : "outline"}
                    size="sm"
                    class="h-7 text-xs"
                    style={filters.profession === prof.code
                        ? ""
                        : `border-color: ${prof.color}; color: ${prof.color};`}
                    onclick={() => handleProfessionChange(prof.code)}
                >
                    {prof.name}
                </Button>
            {/each}
        </div>

        <div class="text-xs text-muted-foreground ml-2">
            {availableCharacters.length} dostępnych
            {#if squad.characterIds.length > 0}
                <span class="text-muted-foreground/70">
                    ({squad.characterIds.length}/10 w squadzie)</span
                >
            {/if}
        </div>
    </div>

    <!-- Character List -->
    <ScrollArea class="h-150">
        {#if availableCharacters.length === 0}
            <div
                class="flex h-full items-center justify-center text-muted-foreground text-sm"
            >
                Brak dostępnych postaci
            </div>
        {:else}
            <div class="space-y-2 pr-3">
                {#each availableCharacters as character (character.id)}
                    {@const result = canAddCharacterToSquad(
                        character.id,
                        squad,
                        group,
                        appStore.accounts,
                    )}
                    <CharacterCard
                        size="sm"
                        {character}
                        disabled={!result.valid}
                        onClick={() =>
                            result.valid && handleSelect(character.id)}
                        showAccount={true}
                        accountName={appStore.accounts.find((a) =>
                            a.characters.some((c) => c.id === character.id),
                        )?.name}
                    />
                {/each}
            </div>
        {/if}
    </ScrollArea>
</div>
