<script setup>
import { DialogTitle } from 'reka-ui'
const props = defineProps()
</script>
<template>
    <DialogTitle v-bind="props" class="sheet-title" data-slot="sheet-title">
        <slot />
    </DialogTitle>
</template>
<style scoped>
.sheet-title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--foreground, #09090b);
    margin: 0;
}
</style>