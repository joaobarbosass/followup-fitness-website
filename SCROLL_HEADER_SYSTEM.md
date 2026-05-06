# Sistema de Header Auto-Ocultável com Detecção de Scroll

## 🎯 Funcionalidades Implementadas

### 1. **Detecção Inteligente de Direção do Scroll**

- Compara a posição atual do scroll com a anterior
- Detecta se o usuário está rolando para **cima** ou **para baixo**
- Limiar de 5 pixels para evitar micro-movimentos

### 2. **Comportamento do Header**

- ✅ **Ao rolar para BAIXO**: Header desaparece suavemente com `translateY(-100%)`
- ✅ **Ao rolar para CIMA**: Header reaparece automaticamente
- ✅ **No topo da página**: Header sempre visível
- ✅ **Menu mobile aberto**: Header é preservado (overflow: hidden)

### 3. **Suavidade e Performance**

- **Transição CSS**: `cubic-bezier(0.22, 1, 0.36, 1)` - easing suave e elegante
- **Throttling**: Máximo 10 verificações por segundo (100ms de intervalo)
- **RequestAnimationFrame**: Sincroniza com o ciclo de renderização do navegador
- **Will-change**: Otimiza a GPU para melhor performance
- **Evita flickering**: Usa limiar de movimento e throttling inteligente

## 🔧 Mudanças Técnicas

### CSS (style.css)

```css
header {
    position: fixed; /* Fixa no topo */
    top: 0;
    left: 0;
    z-index: 1000;
    transform: translateY(0); /* Posição inicial */
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform; /* Otimiza GPU */
}

header.header-hidden {
    transform: translateY(-100%); /* Move para fora da tela */
}

body {
    padding-top: 90px; /* Espaço para o header fixo */
    scroll-padding-top: 90px; /* Ajusta âncoras */
}
```

### JavaScript (main.js)

```javascript
// Rastreia a posição anterior e a direção
let lastScrollTop = 0;
let scrollDirection = "up";

// Throttling para evitar muitas atualizações
let lastScrollTime = 0;
const THROTTLE_DELAY = 100; // ms

// Função que controla a visibilidade
function updateHeaderVisibility() {
    // Calcula a posição atual
    // Compara com a anterior
    // Adiciona/remove classe header-hidden
}

// Escuta o evento scroll com throttling
window.addEventListener("scroll", throttledScroll, { passive: true });
```

## 📊 Variáveis de Controle

| Variável           | Valor            | Propósito                             |
| ------------------ | ---------------- | ------------------------------------- |
| `SCROLL_THRESHOLD` | 5px              | Movimento mínimo para detectar scroll |
| `THROTTLE_DELAY`   | 100ms            | Intervalo mínimo entre verificações   |
| `cubic-bezier`     | 0.22, 1, 0.36, 1 | Curva de animação suave               |
| `transition`       | 0.35s            | Duração da transição                  |

## 🎨 Compatibilidade

- ✅ **Desktop**: Menu sempre visível
- ✅ **Mobile**: Menu hamburger com scroll-hide do header
- ✅ **Scroll suave**: `scroll-behavior: smooth` suportado
- ✅ **Links âncoras**: Respeitam o `scroll-padding-top`
- ✅ **Navegadores modernos**: Chrome, Firefox, Safari, Edge

## ⚡ Performance

- **Throttling automático**: Máximo 10 eventos por segundo
- **RequestAnimationFrame**: Sincronizado com 60fps
- **GPU optimization**: `will-change` e `transform`
- **Passive listeners**: Scroll sem bloqueios
- **Sem reflows desnecessários**: Apenas transform (GPU)

## 🐛 Prevenção de Bugs

1. **Flickering**: Throttling + limiar de movimento
2. **Jitter**: Comparação contínua com último scroll
3. **Performance**: RAF + passive listeners
4. **Mobile**: Menu bloqueado com `overflow: hidden`
5. **Âncoras**: `scroll-padding-top` ajusta automaticamente

## 🎮 Como Funciona na Prática

```
Usuário rola para baixo
    ↓
Header desaparece suavemente (0.35s)
    ↓
Usuário rola para cima
    ↓
Header reaparece suavemente (0.35s)
    ↓
Usuário volta ao topo
    ↓
Header permanece visível
```

## 📝 Notas de Desenvolvimento

- O sistema usa `position: fixed` para o header
- O body tem `padding-top: 90px` para evitar conteúdo sob o header
- O z-index é 1000 (logo abaixo do menu-toggle que é 1001)
- Compatível com menu mobile hamburger existente
- Sem dependências externas (JavaScript puro)

---

**Última atualização**: 6 de maio de 2026
