<template>
    <div class="sheet-header" data-slot="sheet-header">
        <slot />
    </div>
</template>

<style scoped>
.sheet-header {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 1rem;
}
</style>