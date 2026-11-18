<template>
    <div class="xf-editor-wrapper">
      <!-- ПАНЕЛЬ ІНСТРУМЕНТІВ XENFORO -->
      <div class="xf-toolbar" ref="toolbarRef">
        <div class="xf-tools-group">
          <!-- Видалити форматування -->
          <button type="button" class="xf-btn" title="Видалити форматування" @click="clearFormatting">
            <Icon icon="mdi:format-clear" />
          </button>
  
          <span class="xf-sep"></span>
  
          <!-- B, I, U, S -->
          <button type="button" class="xf-btn" title="Жирний (Ctrl+B)" @click="wrapTag('[B]', '[/B]')">
            <Icon icon="mdi:format-bold" />
          </button>
          <button type="button" class="xf-btn" title="Курсив (Ctrl+I)" @click="wrapTag('[I]', '[/I]')">
            <Icon icon="mdi:format-italic" />
          </button>
          <button type="button" class="xf-btn" title="Підкреслений (Ctrl+U)" @click="wrapTag('[U]', '[/U]')">
            <Icon icon="mdi:format-underline" />
          </button>
          <button type="button" class="xf-btn" title="Закреслений" @click="wrapTag('[S]', '[/S]')">
            <Icon icon="mdi:format-strikethrough-variant" />
          </button>
  
          <span class="xf-sep"></span>
  
          <!-- Колір тексту (Палітра) -->
          <div class="xf-dropdown-wrap">
            <button
              type="button"
              class="xf-btn"
              :class="{ active: activePopover === 'color' }"
              title="Колір тексту"
              @click.stop="togglePopover('color')"
            >
              <Icon icon="mdi:water" />
            </button>
  
            <div v-if="activePopover === 'color'" class="xf-popover color-popover" @click.stop>
              <div class="color-grid">
                <button
                  v-for="c in PALETTE_COLORS"
                  :key="c"
                  type="button"
                  class="color-swatch"
                  :style="{ backgroundColor: c }"
                  :title="c"
                  @click="applyColor(c)"
                ></button>
              </div>
              <div class="custom-hex-row">
                <span>HEX</span>
                <input v-model="customHex" type="text" placeholder="#FF6B00" maxlength="7" />
                <button type="button" @click="applyColor(customHex)">OK</button>
              </div>
            </div>
          </div>
  
          <!-- Розмір тексту (A↕) -->
          <div class="xf-dropdown-wrap">
            <button
              type="button"
              class="xf-btn"
              :class="{ active: activePopover === 'size' }"
              title="Розмір тексту"
              @click.stop="togglePopover('size')"
            >
              <Icon icon="mdi:format-size" />
            </button>
  
            <div v-if="activePopover === 'size'" class="xf-popover menu-popover" @click.stop>
              <button
                v-for="sz in FONT_SIZES"
                :key="sz"
                type="button"
                class="menu-item"
                :style="{ fontSize: Math.min(sz, 22) + 'px' }"
                @click="applySize(sz)"
              >
                {{ sz }}
              </button>
            </div>
          </div>
  
          <!-- Сімейство шрифтів (A) -->
          <div class="xf-dropdown-wrap">
            <button
              type="button"
              class="xf-btn"
              :class="{ active: activePopover === 'font' }"
              title="Шрифт"
              @click.stop="togglePopover('font')"
            >
              <Icon icon="mdi:format-font" />
            </button>
  
            <div v-if="activePopover === 'font'" class="xf-popover menu-popover font-menu" @click.stop>
              <button
                v-for="f in FONT_FAMILIES"
                :key="f"
                type="button"
                class="menu-item"
                :style="{ fontFamily: f }"
                @click="applyFont(f)"
              >
                {{ f }}
              </button>
            </div>
          </div>
  
          <span class="xf-sep"></span>
  
          <!-- Вставити однорядковий код (</>) та спойлер (перекреслене око) -->
          <button type="button" class="xf-btn" title="Однорядковий код" @click="wrapTag('[ICODE]', '[/ICODE]')">
            <Icon icon="mdi:code-tags" />
          </button>
          <button type="button" class="xf-btn" title="Спойлер" @click="wrapTag('[SPOILER]', '[/SPOILER]')">
            <Icon icon="mdi:eye-off-outline" />
          </button>
  
          <span class="xf-sep"></span>
  
          <!-- Списки (Dropdown) -->
          <div class="xf-dropdown-wrap">
            <button
              type="button"
              class="xf-btn"
              :class="{ active: activePopover === 'list' }"
              title="Списки"
              @click.stop="togglePopover('list')"
            >
              <Icon icon="mdi:format-list-bulleted" />
              <Icon icon="mdi:menu-down" class="tiny-caret" />
            </button>
  
            <div v-if="activePopover === 'list'" class="xf-popover menu-popover wide-menu" @click.stop>
              <button type="button" class="menu-item" @click="insertList('ordered')">
                <Icon icon="mdi:format-list-numbered" /> Нумерований список
              </button>
              <button type="button" class="menu-item" @click="insertList('unordered')">
                <Icon icon="mdi:format-list-bulleted" /> Маркований список
              </button>
              <button type="button" class="menu-item" @click="wrapTag('[INDENT]', '[/INDENT]')">
                <Icon icon="mdi:format-indent-increase" /> Збільшити відступ
              </button>
              <button type="button" class="menu-item" @click="removeIndent">
                <Icon icon="mdi:format-indent-decrease" /> Зменшити відступ
              </button>
            </div>
          </div>
  
          <!-- Вирівнювання (Dropdown) -->
          <div class="xf-dropdown-wrap">
            <button
              type="button"
              class="xf-btn"
              :class="{ active: activePopover === 'align' }"
              title="Вирівнювання"
              @click.stop="togglePopover('align')"
            >
              <Icon icon="mdi:format-align-left" />
              <Icon icon="mdi:menu-down" class="tiny-caret" />
            </button>
  
            <div v-if="activePopover === 'align'" class="xf-popover icon-bar-popover" @click.stop>
              <button type="button" title="По лівому краю" @click="applyAlign('LEFT')">
                <Icon icon="mdi:format-align-left" />
              </button>
              <button type="button" title="По центру" @click="applyAlign('CENTER')">
                <Icon icon="mdi:format-align-center" />
              </button>
              <button type="button" title="По правому краю" @click="applyAlign('RIGHT')">
                <Icon icon="mdi:format-align-right" />
              </button>
              <button type="button" title="По ширині" @click="applyAlign('JUSTIFY')">
                <Icon icon="mdi:format-align-justify" />
              </button>
            </div>
          </div>
  
          <!-- Формат абзацу / Заголовки (¶) -->
          <div class="xf-dropdown-wrap">
            <button
              type="button"
              class="xf-btn"
              :class="{ active: activePopover === 'heading' }"
              title="Формат абзацу"
              @click.stop="togglePopover('heading')"
            >
              <Icon icon="mdi:format-paragraph" />
              <Icon icon="mdi:menu-down" class="tiny-caret" />
            </button>
  
            <div v-if="activePopover === 'heading'" class="xf-popover menu-popover wide-menu" @click.stop>
              <button type="button" class="menu-item" @click="applyHeading(0)">Звичайний</button>
              <button type="button" class="menu-item h1-item" @click="applyHeading(1)">Заголовок 1</button>
              <button type="button" class="menu-item h2-item" @click="applyHeading(2)">Заголовок 2</button>
              <button type="button" class="menu-item h3-item" @click="applyHeading(3)">Заголовок 3</button>
            </div>
          </div>
  
          <span class="xf-sep"></span>
  
          <!-- Вставити посилання -->
          <div class="xf-dropdown-wrap">
            <button
              type="button"
              class="xf-btn"
              :class="{ active: activePopover === 'link' }"
              title="Вставити посилання"
              @click.stop="togglePopover('link')"
            >
              <Icon icon="mdi:link-variant" />
            </button>
  
            <div v-if="activePopover === 'link'" class="xf-popover form-popover" @click.stop>
              <input v-model="linkForm.url" type="url" placeholder="URL (https://...)" />
              <input v-model="linkForm.text" type="text" placeholder="Текст посилання" />
              <button type="button" class="btn-pop-insert" @click="insertLink">Вставити</button>
            </div>
          </div>
  
          <!-- Вставити зображення -->
          <div class="xf-dropdown-wrap">
            <button
              type="button"
              class="xf-btn"
              :class="{ active: activePopover === 'image' }"
              title="Вставити зображення"
              @click.stop="togglePopover('image')"
            >
              <Icon icon="mdi:image-outline" />
            </button>
  
            <div v-if="activePopover === 'image'" class="xf-popover form-popover" @click.stop>
              <div class="pop-tabs">
                <span class="active"><Icon icon="mdi:link" /> За URL-адресою</span>
              </div>
              <input v-model="imageForm.url" type="url" placeholder="https://i.imgur.com/..." />
              <button type="button" class="btn-pop-insert" @click="insertImage">Вставити</button>
            </div>
          </div>
  
          <!-- Смайлики -->
          <div class="xf-dropdown-wrap">
            <button
              type="button"
              class="xf-btn"
              :class="{ active: activePopover === 'emoji' }"
              title="Смайлики"
              @click.stop="togglePopover('emoji')"
            >
              <Icon icon="mdi:emoticon-happy-outline" />
            </button>
  
            <div v-if="activePopover === 'emoji'" class="xf-popover emoji-popover" @click.stop>
              <div class="emoji-section-title">Смайлики</div>
              <div class="emoji-grid">
                <button
                  v-for="em in EMOJI_LIST"
                  :key="em"
                  type="button"
                  class="emoji-btn"
                  @click="insertText(em)"
                >
                  {{ em }}
                </button>
              </div>
            </div>
          </div>
  
          <!-- Вставити відео / медіа -->
          <button
            type="button"
            class="xf-btn"
            title="Вставити медіа (YouTube, Imgur, TikTok...)"
            @click.stop="isMediaModalOpen = true; activePopover = null"
          >
            <Icon icon="mdi:video-outline" />
          </button>
  
          <!-- Цитата -->
          <button type="button" class="xf-btn" title="Цитата" @click="wrapTag('[QUOTE]', '[/QUOTE]')">
            <Icon icon="mdi:format-quote-close" />
          </button>
  
          <!-- Інтерактивна сітка таблиці -->
          <div class="xf-dropdown-wrap">
            <button
              type="button"
              class="xf-btn"
              :class="{ active: activePopover === 'table' }"
              title="Вставити таблицю"
              @click.stop="togglePopover('table')"
            >
              <Icon icon="mdi:table" />
            </button>
  
            <div v-if="activePopover === 'table'" class="xf-popover table-popover" @click.stop>
              <div class="table-dim-label">{{ hoverRows }} × {{ hoverCols }}</div>
              <div class="table-grid-selector">
                <div v-for="r in 8" :key="r" class="table-grid-row">
                  <div
                    v-for="c in 10"
                    :key="c"
                    class="table-cell-box"
                    :class="{ selected: r <= hoverRows && c <= hoverCols }"
                    @mouseenter="hoverRows = r; hoverCols = c"
                    @click="insertTable(r, c)"
                  ></div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Горизонтальна лінія -->
          <button type="button" class="xf-btn" title="Горизонтальна лінія" @click="insertText('\n[HR]\n')">
            <Icon icon="mdi:minus" />
          </button>
  
          <!-- Блок коду (Модалка) -->
          <button
            type="button"
            class="xf-btn"
            title="Вставити код"
            @click.stop="isCodeModalOpen = true; activePopover = null"
          >
            <Icon icon="mdi:file-code-outline" />
          </button>
  
          <span class="xf-sep"></span>
  
          <!-- Скасувати / Повторити -->
          <button type="button" class="xf-btn" title="Скасувати" @click="undo">
            <Icon icon="mdi:undo" />
          </button>
          <button type="button" class="xf-btn" title="Повторити" @click="redo">
            <Icon icon="mdi:redo" />
          </button>
        </div>
  
        <!-- ПРАВА ЧАСТИНА: ПЕРЕДОГЛЯД ТА КОД BB -->
        <div class="xf-tools-right">
          <button
            type="button"
            class="xf-preview-btn"
            :class="{ active: isPreview }"
            @click="isPreview = !isPreview"
          >
            <Icon icon="mdi:eye-outline" />
            <span>Передогляд</span>
          </button>
        </div>
      </div>
  
      <!-- ОБЛАСТЬ ПЕРЕДОГЛЯДУ АБО ТЕКСТОВЕ ПОЛЕ -->
      <div
        v-if="isPreview"
        class="xf-preview-pane formatted-content"
        v-html="renderBbCodeHtml(modelValue || 'Порожнє повідомлення...')"
      ></div>
  
      <textarea
        v-else
        ref="textareaRef"
        :value="modelValue"
        :rows="rows"
        :placeholder="placeholder"
        class="xf-textarea"
        @input="onInput"
        @keydown="handleKeydown"
      ></textarea>
  
      <!-- МОДАЛКА: ВКЛАСТИ МЕДІА -->
      <div v-if="isMediaModalOpen" class="xf-modal-overlay" @click.self="isMediaModalOpen = false">
        <div class="xf-modal-box">
          <div class="xf-modal-head">
            <h4>Вкласти медіа</h4>
            <button type="button" @click="isMediaModalOpen = false">✕</button>
          </div>
          <div class="xf-modal-body">
            <label>Зазначте посилання для медіа:</label>
            <input
              v-model="mediaUrl"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p class="media-sites-hint">
              Підтримуються: YouTube, Imgur, TikTok, Twitch, Streamable, Spotify, SoundCloud.
            </p>
          </div>
          <div class="xf-modal-foot">
            <button type="button" class="btn-pop-insert" @click="insertMedia">Продовжити</button>
          </div>
        </div>
      </div>
  
      <!-- МОДАЛКА: ВКЛАСТИ КОД -->
      <div v-if="isCodeModalOpen" class="xf-modal-overlay" @click.self="isCodeModalOpen = false">
        <div class="xf-modal-box code-modal">
          <div class="xf-modal-head">
            <h4>Вкласти код</h4>
            <button type="button" @click="isCodeModalOpen = false">✕</button>
          </div>
          <div class="xf-modal-body">
            <div class="code-lang-row">
              <label>Мова:</label>
              <select v-model="codeForm.lang">
                <option value="">Основний код</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="javascript">JavaScript</option>
                <option value="lua">Lua (MTA / Ukraine GTA)</option>
                <option value="php">PHP</option>
                <option value="sql">SQL</option>
              </select>
            </div>
            <textarea
              v-model="codeForm.body"
              rows="8"
              class="code-input-area"
              placeholder="Вставте ваш код сюди..."
            ></textarea>
          </div>
          <div class="xf-modal-foot">
            <button type="button" class="btn-pop-insert" @click="insertCodeBlock">Продовжити</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, onUnmounted } from 'vue'
  import { Icon } from '@iconify/vue'
  import { renderBbCodeHtml } from '../bbcodeParser.js'
  
  const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Напишіть вашу відповідь...' },
    rows: { type: Number, default: 6 }
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const textareaRef = ref(null)
  const toolbarRef = ref(null)
  const activePopover = ref(null)
  const isPreview = ref(false)
  
  // Історія для Undo / Redo
  const history = ref([props.modelValue || ''])
  const historyIndex = ref(0)
  
  const recordHistory = (val) => {
    if (history.value[historyIndex.value] === val) return
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(val)
    historyIndex.value = history.value.length - 1
  }
  
  const onInput = (e) => {
    const val = e.target.value
    emit('update:modelValue', val)
    recordHistory(val)
  }
  
  const undo = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--
      emit('update:modelValue', history.value[historyIndex.value])
    }
  }
  
  const redo = () => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      emit('update:modelValue', history.value[historyIndex.value])
    }
  }
  
  // Палітра кольорів як на відео
  const PALETTE_COLORS = [
    '#61BD6D', '#1ABC9C', '#54ACD2', '#2C82C9', '#9365B8', '#475577', '#CCCCCC',
    '#41A85F', '#00A885', '#3D8EB9', '#2969B0', '#553982', '#28324E', '#000000',
    '#F7DA64', '#FBA026', '#EB6B56', '#E25041', '#A38F84', '#EFEFEF', '#FFFFFF',
    '#FAC51C', '#F37934', '#D14841', '#B8312F', '#7C706B', '#D1D5D8', '#FF3B30'
  ]
  const customHex = ref('#FF6B00')
  
  const FONT_SIZES = [9, 10, 12, 15, 18, 22, 26]
  const FONT_FAMILIES = [
    'Arial',
    'Book Antiqua',
    'Courier New',
    'Georgia',
    'Tahoma',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana'
  ]
  
  const EMOJI_LIST = [
    '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎',
    '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐',
    '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴',
    '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲',
    '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩',
    '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬',
    '👍', '👎', '👏', '🙌', '🤝', '🙏', '💪', '🔥', '❤️', '💔', '💯', '✅'
  ]
  
  const togglePopover = (name) => {
    activePopover.value = activePopover.value === name ? null : name
  }
  
  const closePopovers = (e) => {
    if (toolbarRef.value && !toolbarRef.value.contains(e.target)) {
      activePopover.value = null
    }
  }
  
  onMounted(() => document.addEventListener('click', closePopovers))
  onUnmounted(() => document.removeEventListener('click', closePopovers))
  
  // Допоміжні функції вставки BB-кодів навколо виділеного тексту
  const wrapTag = (openTag, closeTag) => {
    const el = textareaRef.value
    const current = props.modelValue || ''
    if (!el) {
      const next = current + openTag + closeTag
      emit('update:modelValue', next)
      recordHistory(next)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = current.substring(start, end)
    const next = current.substring(0, start) + openTag + selected + closeTag + current.substring(end)
    emit('update:modelValue', next)
    recordHistory(next)
    activePopover.value = null
  }
  
  const insertText = (snippet) => {
    const el = textareaRef.value
    const current = props.modelValue || ''
    if (!el) {
      const next = current + snippet
      emit('update:modelValue', next)
      recordHistory(next)
      activePopover.value = null
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = current.substring(0, start) + snippet + current.substring(end)
    emit('update:modelValue', next)
    recordHistory(next)
    activePopover.value = null
  }
  
  const clearFormatting = () => {
    const el = textareaRef.value
    const current = props.modelValue || ''
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    if (start === end) return
    const selected = current.substring(start, end)
    const cleaned = selected.replace(/\[\/?[A-Z0-9=#'"\s-]+\]/gi, '')
    const next = current.substring(0, start) + cleaned + current.substring(end)
    emit('update:modelValue', next)
    recordHistory(next)
  }
  
  const applyColor = (hex) => {
    if (!hex) return
    wrapTag(`[COLOR=${hex}]`, '[/COLOR]')
  }
  
  const applySize = (sz) => {
    wrapTag(`[SIZE=${sz}]`, '[/SIZE]')
  }
  
  const applyFont = (fontName) => {
    wrapTag(`[FONT=${fontName}]`, '[/FONT]')
  }
  
  const applyAlign = (dir) => {
    wrapTag(`[${dir}]`, `[/${dir}]`)
  }
  
  const applyHeading = (level) => {
    if (level === 0) {
      clearFormatting()
      activePopover.value = null
      return
    }
    wrapTag(`[HEADING=${level}]`, `[/HEADING]`)
  }
  
  const insertList = (type) => {
    const tag = type === 'ordered' ? '[LIST=1]\n[*]Пункт 1\n[*]Пункт 2\n[/LIST]' : '[LIST]\n[*]Пункт 1\n[*]Пункт 2\n[/LIST]'
    insertText('\n' + tag + '\n')
  }
  
  const removeIndent = () => {
    const current = props.modelValue || ''
    const next = current.replace(/\[INDENT\]([\s\S]*?)\[\/INDENT\]/gi, '$1')
    emit('update:modelValue', next)
    recordHistory(next)
    activePopover.value = null
  }
  
  // Посилання та зображення
  const linkForm = reactive({ url: '', text: '' })
  const insertLink = () => {
    if (!linkForm.url.trim()) return
    const label = linkForm.text.trim() || linkForm.url.trim()
    insertText(`[URL=${linkForm.url.trim()}]${label}[/URL]`)
    linkForm.url = ''
    linkForm.text = ''
  }
  
  const imageForm = reactive({ url: '' })
  const insertImage = () => {
    if (!imageForm.url.trim()) return
    insertText(`\n[IMG]${imageForm.url.trim()}[/IMG]\n`)
    imageForm.url = ''
  }
  
  // Таблиця R x C
  const hoverRows = ref(2)
  const hoverCols = ref(3)
  const insertTable = (rows, cols) => {
    let bb = '\n[TABLE]\n'
    for (let r = 0; r < rows; r++) {
      bb += '  [TR]\n'
      for (let c = 0; c < cols; c++) {
        bb += r === 0 ? `    [TH]Заголовок ${c + 1}[/TH]\n` : `    [TD]Текст[/TD]\n`
      }
      bb += '  [/TR]\n'
    }
    bb += '[/TABLE]\n'
    insertText(bb)
  }
  
  // Модалки Медіа та Коду
  const isMediaModalOpen = ref(false)
  const mediaUrl = ref('')
  const insertMedia = () => {
    if (!mediaUrl.value.trim()) return
    insertText(`\n[MEDIA]${mediaUrl.value.trim()}[/MEDIA]\n`)
    mediaUrl.value = ''
    isMediaModalOpen.value = false
  }
  
  const isCodeModalOpen = ref(false)
  const codeForm = reactive({ lang: '', body: '' })
  const insertCodeBlock = () => {
    if (!codeForm.body.trim()) return
    const open = codeForm.lang ? `[CODE=${codeForm.lang}]` : '[CODE]'
    insertText(`\n${open}\n${codeForm.body}\n[/CODE]\n`)
    codeForm.body = ''
    isCodeModalOpen.value = false
  }
  
  // Гарячі клавіші Ctrl+B / Ctrl+I / Ctrl+U
  const handleKeydown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault()
        wrapTag('[B]', '[/B]')
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault()
        wrapTag('[I]', '[/I]')
      } else if (e.key.toLowerCase() === 'u') {
        e.preventDefault()
        wrapTag('[U]', '[/U]')
      }
    }
  }
  </script>
  
  <style scoped>
  .xf-editor-wrapper {
    border: 1px solid #2b3040;
    border-radius: 6px;
    background: #14161e;
    overflow: visible;
  }
  
  .xf-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    background: #1b1e29;
    border-bottom: 1px solid #2b3040;
    padding: 6px 10px;
    border-radius: 6px 6px 0 0;
  }
  
  .xf-tools-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px;
  }
  
  .xf-btn {
    background: none;
    border: none;
    color: #b8bcc8;
    height: 30px;
    min-width: 30px;
    padding: 0 6px;
    border-radius: 4px;
    font-size: 17px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  
  .xf-btn:hover,
  .xf-btn.active {
    background: #2a2f40;
    color: #ffffff;
  }
  
  .tiny-caret {
    font-size: 14px;
    margin-left: -2px;
  }
  
  .xf-sep {
    width: 1px;
    height: 18px;
    background: #2f3547;
    margin: 0 4px;
  }
  
  .xf-dropdown-wrap {
    position: relative;
    display: inline-block;
  }
  
  .xf-popover {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    background: #1c1f2b;
    border: 1px solid #353b4f;
    border-radius: 6px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.75);
    z-index: 2200;
    padding: 8px;
  }
  
  /* ПАЛІТРА КОЛЬОРІВ */
  .color-popover {
    width: 210px;
  }
  
  .color-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
  }
  
  .color-swatch {
    width: 22px;
    height: 22px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    cursor: pointer;
    padding: 0;
  }
  
  .color-swatch:hover {
    transform: scale(1.15);
    border-color: #fff;
  }
  
  .custom-hex-row {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: #9ca3af;
  }
  
  .custom-hex-row input {
    width: 82px;
    background: #111319;
    border: 1px solid #32384d;
    color: #fff;
    padding: 4px 6px;
    border-radius: 4px;
    font-size: 12px;
  }
  
  .custom-hex-row button {
    background: #ff6b00;
    color: #fff;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 700;
    cursor: pointer;
  }
  
  /* СПИСКИ РОЗМІРУ / ШРИФТУ / ЗАГОЛОВКІВ */
  .menu-popover {
    display: flex;
    flex-direction: column;
    min-width: 90px;
    padding: 4px 0;
  }
  
  .font-menu,
  .wide-menu {
    min-width: 190px;
  }
  
  .menu-item {
    background: none;
    border: none;
    color: #e5e7eb;
    padding: 7px 14px;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }
  
  .menu-item:hover {
    background: #2b3042;
    color: #fff;
  }
  
  .h1-item { font-size: 19px; font-weight: 800; }
  .h2-item { font-size: 16px; font-weight: 700; }
  .h3-item { font-size: 14px; font-weight: 700; }
  
  .icon-bar-popover {
    display: flex;
    gap: 4px;
  }
  
  .icon-bar-popover button {
    background: none;
    border: none;
    color: #d1d5db;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 17px;
    cursor: pointer;
  }
  
  .icon-bar-popover button:hover {
    background: #2b3042;
    color: #fff;
  }
  
  /* ФОРМИ ПОСИЛАННЯ ТА ЗОБРАЖЕННЯ */
  .form-popover {
    width: 250px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .pop-tabs {
    border-bottom: 1px solid #2e3446;
    padding-bottom: 6px;
    font-size: 12px;
    color: #ff6b00;
    font-weight: 700;
  }
  
  .form-popover input {
    background: #111319;
    border: 1px solid #32384d;
    color: #fff;
    padding: 7px 10px;
    border-radius: 4px;
    font-size: 13px;
  }
  
  .btn-pop-insert {
    background: linear-gradient(90deg, #ff3b30, #ff6b00);
    color: #fff;
    border: none;
    padding: 7px 14px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    align-self: flex-end;
  }
  
  /* СМАЙЛИКИ */
  .emoji-popover {
    width: 280px;
    max-height: 220px;
    overflow-y: auto;
  }
  
  .emoji-section-title {
    font-size: 11px;
    color: #8a8d98;
    margin-bottom: 6px;
    font-weight: 700;
  }
  
  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
  }
  
  .emoji-btn {
    background: none;
    border: none;
    font-size: 18px;
    padding: 3px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .emoji-btn:hover {
    background: #2b3042;
  }
  
  /* СІТКА ТАБЛИЦІ */
  .table-popover {
    width: 210px;
  }
  
  .table-dim-label {
    text-align: center;
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 6px;
  }
  
  .table-grid-selector {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  
  .table-grid-row {
    display: flex;
    gap: 3px;
    justify-content: center;
  }
  
  .table-cell-box {
    width: 15px;
    height: 15px;
    border: 1px solid #3c4359;
    background: #111319;
    cursor: pointer;
  }
  
  .table-cell-box.selected {
    background: rgba(255, 107, 0, 0.35);
    border-color: #ff6b00;
  }
  
  /* ПЕРЕДОГЛЯД */
  .xf-preview-btn {
    background: none;
    border: 1px solid transparent;
    color: #9ca3af;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
  }
  
  .xf-preview-btn:hover,
  .xf-preview-btn.active {
    background: #2a2f40;
    color: #fff;
  }
  
  .xf-textarea {
    width: 100%;
    background: #14161e;
    border: none;
    padding: 14px;
    color: #fff;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.6;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
    border-radius: 0 0 6px 6px;
  }
  
  .xf-preview-pane {
    min-height: 140px;
    padding: 14px;
    background: #111319;
    font-size: 14px;
    line-height: 1.65;
    color: #e5e7eb;
    border-radius: 0 0 6px 6px;
  }
  
  /* МОДАЛКИ МЕДІА ТА КОДУ */
  .xf-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.82);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 4000;
    padding: 16px;
  }
  
  .xf-modal-box {
    background: #181a24;
    border: 1px solid #2e3446;
    border-radius: 8px;
    width: 100%;
    max-width: 460px;
    overflow: hidden;
    color: #fff;
  }
  
  .code-modal {
    max-width: 580px;
  }
  
  .xf-modal-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background: #12141c;
    border-bottom: 1px solid #262b3a;
  }
  
  .xf-modal-head h4 {
    margin: 0;
    font-size: 16px;
  }
  
  .xf-modal-head button {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 16px;
    cursor: pointer;
  }
  
  .xf-modal-body {
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .xf-modal-body label {
    font-size: 13px;
    color: #9ca3af;
  }
  
  .xf-modal-body input,
  .xf-modal-body select {
    background: #0f1117;
    border: 1px solid #2e3446;
    color: #fff;
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .code-lang-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .code-input-area {
    width: 100%;
    background: #0b0c10;
    border: 1px solid #2e3446;
    color: #a5f3fc;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    padding: 12px;
    border-radius: 6px;
    box-sizing: border-box;
  }
  
  .media-sites-hint {
    font-size: 12px;
    color: #6c7284;
    margin: 0;
  }
  
  .xf-modal-foot {
    padding: 12px 18px;
    background: #12141c;
    border-top: 1px solid #262b3a;
    display: flex;
    justify-content: flex-end;
  }
  </style>