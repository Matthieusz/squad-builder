<script lang="ts">
    import { appStore } from "$lib/stores/app.svelte";
    import { parseProfileHtml } from "$lib/utils/parser";
    import { validateAccountName } from "$lib/utils/validation";
    import type { Character } from "$lib/types";

    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Input } from "$lib/components/ui/input";
    import {
        Dialog,
        DialogContent,
        DialogHeader,
        DialogTitle,
        DialogFooter,
    } from "$lib/components/ui/dialog";
    import { Alert, AlertDescription } from "$lib/components/ui/alert";
    import CharacterCard from "./CharacterCard.svelte";
    import {
        IconAlertCircle,
        IconArrowLeft,
        IconCheck,
    } from "@tabler/icons-svelte";

    interface Props {
        open: boolean;
        onOpenChange: (open: boolean) => void;
    }

    let { open = $bindable(), onOpenChange }: Props = $props();

    let step = $state<"input" | "preview">("input");
    let htmlInput = $state("");
    let accountName = $state("");
    let parsedCharacters = $state<Character[]>([]);
    let error = $state("");
    let isParsing = $state(false);

    function handleOpenChange(newOpen: boolean) {
        if (!newOpen) {
            reset();
        }
        onOpenChange(newOpen);
    }

    function parseHtml() {
        if (!htmlInput.trim()) {
            error = "Wklej HTML";
            return;
        }

        isParsing = true;
        error = "";

        try {
            const result = parseProfileHtml(htmlInput);
            parsedCharacters = result.characters.map((char) => ({
                ...char,
                accountId: "",
            }));

            if (parsedCharacters.length === 0) {
                error =
                    "Nie znaleziono żadnych postaci w kodzie HTML. Upewnij się, że wklejasz pełną stronę profilu.";
            } else {
                accountName = result.accountName;
                step = "preview";
            }
        } catch {
            error =
                "Nie udało się przetworzyć kodu HTML. Sprawdź zawartość i spróbuj ponownie.";
            parsedCharacters = [];
        } finally {
            isParsing = false;
        }
    }

    function saveAccount() {
        const validationErrors = validateAccountName(accountName);
        if (validationErrors.length > 0) {
            error = validationErrors[0].message;
            return;
        }

        if (parsedCharacters.length === 0) {
            error = "Brak postaci do zapisania";
            return;
        }

        const existingAccount = appStore.accounts.find(
            (a) => a.name.toLowerCase() === accountName.toLowerCase(),
        );
        if (existingAccount) {
            error = `Konto "${accountName}" już istnieje`;
            return;
        }

        const accountId = crypto.randomUUID();
        const characters = parsedCharacters.map((char) => ({
            ...char,
            accountId,
        }));

        appStore.addAccount({
            id: accountId,
            name: accountName,
            characters,
        });

        reset();
        onOpenChange(false);
    }

    function reset() {
        htmlInput = "";
        accountName = "";
        parsedCharacters = [];
        error = "";
        step = "input";
    }

    function goBackToInput() {
        step = "input";
        error = "";
    }

    function handleCancel() {
        reset();
        onOpenChange(false);
    }
</script>

<Dialog {open} onOpenChange={handleOpenChange}>
    <DialogContent
        class="max-w-2xl! flex max-h-[90vh] w-full flex-col overflow-hidden p-6"
    >
        <DialogHeader>
            <DialogTitle>
                {#if step === "input"}
                    Importuj konto
                {:else}
                    Importuj postać
                {/if}
            </DialogTitle>
        </DialogHeader>

        <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
            {#if error}
                <Alert variant="destructive" class="mb-4 shrink-0">
                    <IconAlertCircle class="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            {/if}

            {#if step === "input"}
                <!-- Input Step -->
                <div class="flex flex-1 flex-col gap-4 overflow-hidden">
                    <div class="space-y-2">
                        <label for="html-input" class="text-sm font-medium">
                            Wklej kod HTML
                        </label>
                        <Textarea
                            id="html-input"
                            placeholder="Wklej pełny kod HTML ze strony swojego profilu Margonem..."
                            bind:value={htmlInput}
                            rows={10}
                            class="flex-1 font-mono text-xs"
                        />
                    </div>
                </div>

                <DialogFooter class="shrink-0 justify-end gap-2 pt-4">
                    <Button variant="outline" onclick={handleCancel}
                        >Anuluj</Button
                    >
                    <Button
                        onclick={parseHtml}
                        disabled={!htmlInput.trim() || isParsing}
                    >
                        {isParsing ? "Parsuje" : "Parsuj HTML"}
                    </Button>
                </DialogFooter>
            {:else}
                <!-- Preview Step -->
                <div class="flex flex-1 flex-col gap-4 overflow-hidden">
                    <div class="space-y-2">
                        <label for="account-name" class="text-sm font-medium">
                            Nazwa konta
                        </label>
                        <Input
                            id="account-name"
                            bind:value={accountName}
                            placeholder="Wprowadź nazwę konta"
                        />
                    </div>

                    <div class="flex flex-1 flex-col gap-2 overflow-hidden">
                        <div class="text-sm font-medium shrink-0">
                            Znaleziono {parsedCharacters.length}
                            {parsedCharacters.length === 1
                                ? "postać"
                                : "postaci"}
                            — kliknij importuj, aby zapisać
                        </div>
                        <div class="flex-1 overflow-y-auto pr-2">
                            <div class="space-y-2">
                                {#each parsedCharacters as character (character.id)}
                                    <CharacterCard
                                        {character}
                                        disabled={true}
                                        class="pointer-events-none"
                                    />
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter class="shrink-0 justify-between pt-4">
                    <Button variant="ghost" onclick={goBackToInput}>
                        <IconArrowLeft class="mr-2 h-4 w-4" />
                        Powrót
                    </Button>
                    <Button
                        onclick={saveAccount}
                        disabled={parsedCharacters.length === 0 ||
                            !accountName.trim()}
                    >
                        <IconCheck class="mr-2 h-4 w-4" />
                        Importuj konto
                    </Button>
                </DialogFooter>
            {/if}
        </div>
    </DialogContent>
</Dialog>
