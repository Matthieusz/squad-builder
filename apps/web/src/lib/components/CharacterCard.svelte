<script lang="ts">
    import type { Character } from "$lib/types";
    import { getProfessionStyle } from "$lib/utils/profession";
    import { Badge } from "$lib/components/ui/badge";
    import { cn } from "$lib/utils";

    interface Props {
        character: Character;
        showAccount?: boolean;
        accountName?: string;
        selected?: boolean;
        disabled?: boolean;
        onClick?: () => void;
        class?: string;
        size?: "sm" | "md" | "lg";
    }

    let {
        character,
        showAccount = false,
        accountName = "",
        selected = false,
        disabled = false,
        onClick,
        class: className = "",
        size = "md",
    }: Props = $props();

    const profStyle = $derived(getProfessionStyle(character.prof));

    const textSizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
    };
</script>

<button
    type="button"
    class={cn(
        "relative flex gap-3 rounded-lg border p-3 transition-all w-full text-left items-center",
        selected
            ? "border-primary bg-primary/10"
            : "border-border bg-card hover:border-primary-foreground/50",
        disabled && "cursor-not-allowed opacity-60",
        className,
    )}
    {disabled}
    onclick={onClick}
>
    <!-- Character Sprite - Top-left frame only -->
    <div
        class="shrink-0 overflow-hidden rounded-md h-12 w-8"
        style={character.spriteUrl
            ? `background-image: url('${character.spriteUrl}'); background-position: 0% 0%;`
            : ""}
    >
        {#if !character.spriteUrl}
            <span
                class="flex h-full w-full items-center justify-center text-xs text-muted-foreground"
            >
                ?
            </span>
        {/if}
    </div>

    <div
        class="flex min-w-0 flex-1 flex-col justify-center gap-1 overflow-hidden"
    >
        <!-- Character Name -->
        <div class={cn("font-semibold truncate", textSizeClasses[size])}>
            {character.nick}
        </div>

        <!-- Level and Profession -->
        <div class="flex items-center gap-2 text-xs">
            <span class="text-muted-foreground">Lvl {character.lvl}</span>
            <Badge
                variant="outline"
                class="text-xs"
                style="border-color: {profStyle.color}; color: {profStyle.color};"
            >
                {character.profname}
            </Badge>
        </div>

        <!-- World + Clan -->
        <div class="truncate text-xs text-muted-foreground">
            {character.world}
            {#if character.clan}
                <span class="text-muted-foreground/70">• {character.clan}</span>
            {/if}
        </div>
    </div>

    {#if showAccount && accountName}
        <div
            class="absolute bottom-1 right-2 text-[10px] text-muted-foreground/50"
        >
            {accountName}
        </div>
    {/if}

    {#if selected}
        <div
            class="absolute right-2 top-2 h-3 w-3 rounded-full bg-primary"
        ></div>
    {/if}
</button>
