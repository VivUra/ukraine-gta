<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import Dropdown from './Dropdown.vue';
</script>

<template>
    <Sheet>
        <SheetTrigger class="mobile-actions">
            <Icon class="menu-bar" icon="lucide:menu" />
        </SheetTrigger>

        <SheetContent side="left" class="header-sheet-content">
            <nav class="header-nav">
                <a href="https://ukraine-gta.com.ua/uk/" class="nav-link active">
                    <span class="nav-icon">
                        <Icon icon="majesticons:home" />
                    </span>
                    <span class="nav-text">Головна</span>
                </a>
                <a href="https://forum.ukraine-gta.com.ua/" class="nav-link">
                    <span class="nav-icon">
                        <Icon icon="mynaui:hash-square-solid" />
                    </span>
                    <span class="nav-text">Форум</span>
                </a>
                <a href="https://ukraine-gta.com.ua/uk/donate/" class="nav-link">
                    <span class="nav-icon">
                        <Icon icon="mage:bag-a-fill" />
                    </span>
                    <span class="nav-text">Ігровий магазин</span>
                </a>
                <a href="https://wiki.ukraine-gta.com.ua/" class="nav-link">
                    <span class="nav-icon">
                        <Icon icon="mdi:internet" />
                    </span>
                    <span class="nav-text">WIKI</span>
                </a>
            </nav>

            <Dropdown />

            <button class="btn-cabinet">
                <span class="btn-icon">
                    <Icon icon="carbon:user-avatar-filled" />
                </span>
                <a href="https://ukraine-gta.com.ua/uk/cabinet/login" class="btn-text">Кабінет</a>
            </button>

        </SheetContent>
    </Sheet>
</template>

<style scoped>
/* Кнопка тригера */
.mobile-actions {
    display: none;
}

.menu-bar {
    width: 30px;
    height: 30px;
    color: rgba(255, 255, 255, .2);
}

@media (max-width: 1199px) {
    .mobile-actions {
        display: block;
        background: rgba(255, 255, 255, .2);
        border: none;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
    }
}

/* Стилі для контенту Sheet */
:global(.header-sheet-content) {
    top: 105px !important;
    background-color: #111214 !important;
    /* Темний фон як на фото */
    color: #ffffff;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    height: 100%;
    width: 100%;
    max-width: 400px;
    border-left: none !important;
}

/* Кнопка закриття */
.close-menu-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: transparent;
    border: none;
    color: #555;
    font-size: 24px;
    cursor: pointer;
}

/* Логотип */
.menu-logo {
    margin-top: 20px;
    margin-bottom: 40px;
}

.menu-logo img {
    height: auto;
    max-width: 140px;
}

/* Навігація */
.header-nav {
    width: 100%;
    max-width: 260px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #7a7c85;
    /* Сірий для неактивних */
    text-decoration: none;
    font-size: 18px;
    font-weight: 500;
    transition: color 0.2s;
}

.nav-link:hover,
.nav-link.active {
    color: #ffffff;
    /* Білий для активного/наведення */
}

.nav-icon {
    font-size: 22px;
    display: flex;
    align-items: center;
    opacity: 0.6;
}

.nav-link.active .nav-icon {
    opacity: 1;
}

.btn-cabinet {
    background: var(--gradient);
    color: #ffffff;
    border: none;
    padding: 14px 36px;
    border-radius: 8px;
    font-family: var(--font-primary);
    font-size: 15px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 6px 20px rgba(236, 43, 29, 0.25);
}

.btn-cabinet:hover {
    filter: brightness(1.1);
}

.btn-cabinet:active {
    transform: scale(0.96);
}

.btn-icon {
    font-size: 20px;
    display: flex;
    align-items: center;
}
</style>