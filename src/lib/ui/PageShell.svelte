<script lang="ts">

    import type { Snippet } from 'svelte'

    interface Props {
        contentWidth?: string;
        isHeader?: boolean;
        headerTitle?: string;
        headerDesc?: string;
        articleGap?: string;
        children: Snippet
    }

    let {
        contentWidth = "",
        isHeader = true,
        headerTitle = "PageTitle",
        headerDesc = "PageDesc",
        articleGap = "gap-bs",
        children
    }: Props = $props()

</script>

<section class="main-section pb-xl">
    <section class="{contentWidth}">
        {#if isHeader}
            <header class="page-header box gap-sm">
                <h1 class="page-title">{headerTitle}</h1>
                <p class="page-desc">{headerDesc}</p>
            </header>
        {/if}
        <article class="box {articleGap}">
            {@render children()}
        </article>
    </section>
</section>