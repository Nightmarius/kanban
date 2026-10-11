# Tailwind CSS Setup Complete

## Status
- ✅ TailwindCSS v3 installed as dev dependency
- ✅ postcss autoprefixer installed as dev dependency  
- ✅ tailwind.config.js created with darkMode: 'media'
- ✅ postcss.config.js created (exports { plugins: { tailwindcss: {}, autoprefixer: {} } })
- ✅ src/styles.css updated to @tailwind directives + variables only

## What Needs To Be Done Next

### Component Class Mapping (Original CSS → Tailwind)

#### Card.tsx (.card)
```
.bg-[var(--card-bg)]                     - Original bg: var(--card-bg)
.rounded-sm                              - border-radius: 6px
.p-2.5                                   - padding: 10px 12px  
.text-sm                                 - font-size: 14px
.leading-relaxed                         - line-height: 1.5
.flex.items-start.gap-2                  - gap: 8px
.select-none                             - user-select: none
.shadow                                  - Original box-shadow CSS var
.cursor-grab                             - cursor: grab
.opacity-35                              - drag state
.scale-95.rorate-2                       - drag transform

.card-text (span): flex-1, px-0.5 py-0  - padding: 2px 0
.btn-item-action: w-6 h-6, rounded       - 24x24px btns
```

#### Column.tsx (.column)
```
.bg-[var(--col-bg)]                      - Original bg color
.rounded-lg                              - border-radius: 8px
.min-w-[280px]                           - min-width
.max-w-[340px]                           - max-width
.flex-1                                  - flex: 1
.border-2.transparent                    - border transparent
.hover:bg-cardbg                         - hover bg
```

**.column.drag-over** = `border-accent shadow-lg` when dragging

#### Column.tsx (.items)
```
.p-2                                    - padding: 8px  
.min-h-[40px]                           - min-height
.flex.flex-col.gap-1.5                  - gap: 6px
.flex-1.overflow-y-auto                 - flex: 1, overflow auto
```

#### ColumnList.tsx (.track)
```
.flex-1.flex.gap-3                      - flex: 1, gap: 12px  
.overflow-x.auto                        - overflow horizontal auto
.p-0.px-2.py-4                          - padding: 0 8px 16px
```

#### Board.tsx (.board-area) = `flex flex-col h-full`
#### BoardPicker.tsx = multiple components

## Custom Classes to Keep in CSS (can't do in Tailwind)
`.drop-ahead::before` - pseudo-element for drop indicator
Scrollbar styling - not available in Tailwind utilities

## Variables Used by Components
--bg, --col-bg, --card-bg, --text, --border, --accent

