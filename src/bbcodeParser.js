export const renderBbCodeHtml = (rawText) => {
    if (!rawText) return ''
  
    // Екрануємо небезпечний HTML, залишаючи підтримку наших тегів
    let html = rawText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  
    // 1. Блоки коду [CODE=lang]...[/CODE]
    html = html.replace(/\[CODE(?:=([a-z0-9_-]+))?\]([\s\S]*?)\[\/CODE\]/gi, (_, lang, code) => {
      const label = lang ? `<div class="bb-code-lang">Код (${lang.toUpperCase()}):</div>` : '<div class="bb-code-lang">Код:</div>'
      return `<div class="bb-code-block">${label}<pre><code>${code.trim()}</code></pre></div>`
    })
  
    // 2. Однорядковий код [ICODE]...[/ICODE]
    html = html.replace(/\[ICODE\](.*?)\[\/ICODE\]/gi, '<code class="bb-icode">$1</code>')
  
    // 3. Спойлер [SPOILER]...[/SPOILER]
    html = html.replace(
      /\[SPOILER(?:=(.*?))?\]([\s\S]*?)\[\/SPOILER\]/gi,
      (_, title, content) =>
        `<details class="bb-spoiler"><summary>${title || 'Спойлер'}</summary><div class="bb-spoiler-body">${content}</div></details>`
    )
  
    // 4. Цитата [QUOTE]...[/QUOTE]
    html = html.replace(
      /\[QUOTE(?:=(.*?))?\]([\s\S]*?)\[\/QUOTE\]/gi,
      (_, author, content) =>
        `<blockquote class="bb-quote">${author ? `<div class="bb-quote-author">${author} написав(ла):</div>` : ''}${content}</blockquote>`
    )
  
    // 5. Заголовки [HEADING=1..3]
    html = html.replace(/\[HEADING=1\](.*?)\[\/HEADING\]/gi, '<h2 class="bb-h1">$1</h2>')
    html = html.replace(/\[HEADING=2\](.*?)\[\/HEADING\]/gi, '<h3 class="bb-h2">$1</h3>')
    html = html.replace(/\[HEADING=3\](.*?)\[\/HEADING\]/gi, '<h4 class="bb-h3">$1</h4>')
  
    // 6. Базове форматування B, I, U, S + підтримка старого Markdown (**...**)
    html = html
      .replace(/\[B\]([\s\S]*?)\[\/B\]/gi, '<strong>$1</strong>')
      .replace(/\[I\]([\s\S]*?)\[\/I\]/gi, '<em>$1</em>')
      .replace(/\[U\]([\s\S]*?)\[\/U\]/gi, '<u>$1</u>')
      .replace(/\[S\]([\s\S]*?)\[\/S\]/gi, '<s>$1</s>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
    // 7. Колір, розмір, шрифт
    html = html
      .replace(/\[COLOR=(#[0-9a-fA-F]{3,6}|[a-zA-Z]+)\]([\s\S]*?)\[\/COLOR\]/gi, '<span style="color:$1">$2</span>')
      .replace(/\[SIZE=(\d+)\]([\s\S]*?)\[\/SIZE\]/gi, '<span style="font-size:$1px">$2</span>')
      .replace(/\[FONT=([a-zA-Z0-9\s-]+)\]([\s\S]*?)\[\/FONT\]/gi, '<span style="font-family:\'$1\', sans-serif">$2</span>')
  
    // 8. Вирівнювання та відступ
    html = html
      .replace(/\[LEFT\]([\s\S]*?)\[\/LEFT\]/gi, '<div style="text-align:left">$1</div>')
      .replace(/\[CENTER\]([\s\S]*?)\[\/CENTER\]/gi, '<div style="text-align:center">$1</div>')
      .replace(/\[RIGHT\]([\s\S]*?)\[\/RIGHT\]/gi, '<div style="text-align:right">$1</div>')
      .replace(/\[JUSTIFY\]([\s\S]*?)\[\/JUSTIFY\]/gi, '<div style="text-align:justify">$1</div>')
      .replace(/\[INDENT\]([\s\S]*?)\[\/INDENT\]/gi, '<div style="padding-left:28px">$1</div>')
  
    // 9. Списки [LIST=1] та [LIST]
    html = html.replace(/\[LIST=1\]([\s\S]*?)\[\/LIST\]/gi, (_, items) => {
      const li = items
        .split('[*]')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `<li>${s}</li>`)
        .join('')
      return `<ol class="bb-list">${li}</ol>`
    })
    html = html.replace(/\[LIST\]([\s\S]*?)\[\/LIST\]/gi, (_, items) => {
      const li = items
        .split('[*]')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `<li>${s}</li>`)
        .join('')
      return `<ul class="bb-list">${li}</ul>`
    })
  
    // 10. Посилання, зображення та відео (YouTube)
    html = html
      .replace(/\[URL=(https?:\/\/[^\]]+)\](.*?)\[\/URL\]/gi, '<a href="$1" target="_blank" rel="noopener" class="bb-link">$2</a>')
      .replace(/\[IMG\](https?:\/\/[^\[]+)\[\/IMG\]/gi, '<img src="$1" alt="Зображення" class="bb-img" />')
      .replace(/\[MEDIA\](https?:\/\/[^\[]+)\[\/MEDIA\]/gi, (_, url) => {
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
        if (ytMatch) {
          return `<div class="bb-video-wrap"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allowfullscreen></iframe></div>`
        }
        return `<a href="${url}" target="_blank" rel="noopener" class="bb-link">${url}</a>`
      })
  
    // 11. Таблиці [TABLE][TR][TH][TD]
    html = html
      .replace(/\[TABLE\]([\s\S]*?)\[\/TABLE\]/gi, '<table class="bb-table">$1</table>')
      .replace(/\[TR\]([\s\S]*?)\[\/TR\]/gi, '<tr>$1</tr>')
      .replace(/\[TH\]([\s\S]*?)\[\/TH\]/gi, '<th>$1</th>')
      .replace(/\[TD\]([\s\S]*?)\[\/TD\]/gi, '<td>$1</td>')
  
    // 12. Горизонтальна лінія [HR] та переноси рядків
    html = html
      .replace(/\[HR\]/gi, '<hr class="bb-hr" />')
      .replace(/\n/g, '<br />')
  
    return html
  }