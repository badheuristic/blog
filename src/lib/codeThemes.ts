// Grayscale syntax themes for Shiki. Four shades per theme, matching --code-1..4 in
// tokens.css: keywords and function names darkest, everything else a step lighter,
// strings and punctuation lighter still, comments lightest (and italic). Both themes are
// emitted at once; prose.css picks one from data-theme.

type Shades = { bg: string; c1: string; c2: string; c3: string; c4: string }

function mono(name: string, type: 'light' | 'dark', s: Shades) {
  return {
    name,
    type,
    colors: { 'editor.background': s.bg, 'editor.foreground': s.c2 },
    tokenColors: [
      { settings: { foreground: s.c2, background: s.bg } },
      {
        scope: ['comment', 'punctuation.definition.comment'],
        settings: { foreground: s.c4, fontStyle: 'italic' },
      },
      {
        scope: [
          'keyword',
          'storage',
          'storage.type',
          'storage.modifier',
          'keyword.control',
          'keyword.operator.new',
          'keyword.operator.expression',
          'variable.language',
          'entity.name.tag',
        ],
        settings: { foreground: s.c1 },
      },
      {
        scope: ['entity.name.function', 'support.function', 'meta.function-call entity.name.function'],
        settings: { foreground: s.c1 },
      },
      {
        scope: [
          'string',
          'string.quoted',
          'string.template',
          'constant.other.symbol',
          'markup.inline.raw',
          'punctuation',
          'meta.brace',
          'keyword.operator',
          'entity.other.attribute-name',
        ],
        settings: { foreground: s.c3 },
      },
      {
        scope: ['constant.numeric', 'constant.language', 'support.constant', 'entity.name.type', 'support.type'],
        settings: { foreground: s.c2 },
      },
    ],
  }
}

export const codeLight = mono('mono-light', 'light', {
  bg: '#f3f3f3',
  c1: '#000000',
  c2: '#4a4a4a',
  c3: '#7a7a7a',
  c4: '#a3a3a3',
})

export const codeDark = mono('mono-dark', 'dark', {
  bg: '#2a2a2a',
  c1: '#ffffff',
  c2: '#d4d4d4',
  c3: '#a8a8a8',
  c4: '#7c7c7c',
})
