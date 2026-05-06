# Menu Off-Canvas - Barra Lateral Direita

## 📋 Resumo das Mudanças

O menu hambúrguer foi completamente transformado em um **menu off-canvas que desliza pela direita**, seguindo o padrão visual moderno de navegação mobile.

---

## 🎨 Mudanças Visuais

### ✨ Layout Novo

- **Origem**: Menu desliza da **direita** (ao invés de cima)
- **Altura**: Ocupa 100% da altura da tela
- **Largura**: Máximo de 320px em dispositivos mobile
- **Overlay**: Fundo escuro semi-transparente com blur quando aberto
- **Animação**: Suave com `cubic-bezier(0.22, 1, 0.36, 1)` de 0.45s

### 📌 Item Destacado (Camisetas)

- **Estilo**: Fundo com gradiente ouro + borda dourada
- **Badge**: "3rd DROP" em texto pequeno acima de "Camisetas"
- **Cores**: Usa a paleta existente (#bfa11d e #d6b94a)
- **Posição**: Item especial com espaçamento visual diferenciado

### 🔘 Botão CTA (Agendar Agora)

- **Estilo**: Botão com gradiente ouro (#bfa11d → #d6b94a)
- **Posição**: Fixado na base do menu
- **Efeito**: Sombra e escala ao clicar
- **Animação**: Aparece com delay de 0.48s (último elemento)

### 🔐 Botão Fechar

- **Localização**: Topo direito do menu
- **Ícone**: Material Symbols "close"
- **Estilo**: Botão transparente com borda sutil
- **Interação**: Fecha o menu

---

## 🔧 Mudanças Técnicas

### HTML

```html
<!-- Novo item com badge -->
<li class="menu-highlight">
    <a href="#camiseta">
        <span class="menu-item-label">Camisetas</span>
        <span class="menu-item-badge">3rd DROP</span>
    </a>
</li>

<!-- Botão fechar -->
<button class="menu-close">
    <span class="material-symbols-outlined">close</span>
</button>

<!-- Botão CTA -->
<a href="#contato" class="menu-cta-button">Agendar agora</a>
```

### CSS Mobile (768px)

```css
.links_header {
    position: fixed;
    top: 0;
    right: 0; /* Vem da DIREITA */
    width: 100%;
    max-width: 320px;
    height: 100vh;

    background: linear-gradient(180deg, #1b1b1b 0%, #252525 100%);

    transform: translateX(100%); /* Começa fora da tela */
}

.links_header.active {
    transform: translateX(0); /* Desliza para dentro */
}
```

### Overlay/Backdrop

```css
body.menu-open::before {
    content: "";
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    z-index: 999;
}
```

### JavaScript

```javascript
// Novo: botão fechar
if (menuClose) {
    menuClose.addEventListener("click", (e) => {
        e.stopPropagation();
        closeMenu();
    });
}
```

---

## 📊 Hierarquia de Componentes

```
Menu Off-Canvas (links_header)
├── Botão Fechar (menu-close)
├── Lista de Links (ul)
│   ├── Sobre mim
│   ├── Como Funciona
│   ├── Feedbacks
│   ├── Camisetas ⭐ (menu-highlight)
│   │   ├── Label "Camisetas"
│   │   └── Badge "3rd DROP"
│   └── Planos
└── Botão CTA (menu-cta-button)
    └── "Agendar agora"
```

---

## 🎯 Lógica de Interação Mantida

✅ **Tudo que funcionava continua funcionando:**

- Clique no toggle (hambúrguer) → abre/fecha
- Clique fora do menu → fecha
- Clique em um link → navega e fecha
- Clique no botão fechar → fecha
- Resize para desktop (> 768px) → fecha menu
- Classe `menu-open` no body → controla scroll

---

## 🎨 Paleta de Cores

| Elemento        | Cor                  | Hex               |
| --------------- | -------------------- | ----------------- |
| Background      | Cinza escuro         | #1b1b1b           |
| Gradient Menu   | Cinza → Cinza escuro | #1b1b1b → #252525 |
| Texto           | Branco/Cinza         | #eaeaea           |
| Destaque (Ouro) | Ouro                 | #bfa11d           |
| Ouro claro      | Ouro claro           | #d6b94a           |
| Overlay         | Preto semi           | rgba(0,0,0,0.5)   |

---

## 📱 Comportamento Responsivo

### Desktop (> 768px)

- Menu completamente ocultado pela media query
- Links visíveis na linha do header

### Mobile (≤ 768px)

- Menu off-canvas funcional
- Toggle (hambúrguer) visível
- Menu desliza da direita

### Extra-pequeno (≤ 480px)

- Header altura reduzida (75px)
- Menu adapta à tela (max 320px)

---

## ⚡ Performance

- **Transform only**: Usa apenas `translateX()` para animações (GPU)
- **Throttling**: Sistema de scroll mantém eficiência
- **Backdrop-filter**: Blur leve sem impacto
- **Hardware acceleration**: `will-change` (quando necessário)

---

## 🐛 Testes Recomendados

1. ✅ Abrir menu no mobile - deve deslizar da direita
2. ✅ Clicar fora - deve fechar suavemente
3. ✅ Clicar em link - deve navegar e fechar
4. ✅ Clicar botão fechar - deve fechar
5. ✅ Clicar "Agendar agora" - deve ir para #contato
6. ✅ Redimensionar para desktop - deve fechar
7. ✅ Item "Camisetas" - deve ter destaque visual
8. ✅ Overlay - deve aparecer quando menu aberto

---

## 📝 Notas

- Mantém **100% da lógica anterior** funcionando
- Código **limpo e moderno**
- Segue **padrões de UX** mobile
- **Sem dependências externas** - JavaScript puro
- **Totalmente responsivo**

---

**Data**: 6 de maio de 2026
**Status**: ✅ Implementado e Pronto
