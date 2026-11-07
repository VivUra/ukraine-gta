<template>
    <div class="sheet-footer" data-slot="sheet-footer">
        <slot />
    </div>
</template>

<style scoped>
.sheet-footer {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
}
</style>