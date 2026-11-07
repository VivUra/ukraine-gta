<script setup>
import { DialogTrigger } from 'reka-ui';

const props = defineProps({
    asChild: { type: Boolean, default: false }
})
</script>

<template>
    <DialogTrigger v-bind="props" data-slot="sheet-trigger">
        <slot />
    </DialogTrigger>
</template>
