# 📁 Pasta de Imagens (frontend/img/)

## Arquivos

### logo.svg
Logo padrão do projeto Saidinha em formato SVG (vetorial).

**Características:**
- Formato vetorial (escalável sem perder qualidade)
- Pode ser editado com Inkscape, Adobe Illustrator ou qualquer editor SVG
- Cor principal: `#667eea` (azul)
- Usado em: Topbar, tela de login, tela de boas-vindas

## Como Substituir o Logo

### Opção 1: Usar um PNG Customizado
1. Coloque sua imagem em `frontend/img/logo.png`
2. Modifique o `index.html` trocando:
   ```html
   <!-- De: -->
   <img src="img/logo.svg" alt="Saidinha">
   
   <!-- Para: -->
   <img src="img/logo.png" alt="Saidinha">
   ```

### Opção 2: Editar o SVG
1. Abra `logo.svg` em um editor:
   - **Grátis**: Inkscape (www.inkscape.org)
   - **Online**: Gravit Design (editor.gravit.io)
   - **Pago**: Adobe Illustrator, Figma

2. Edite cores, texto, ícone

3. Salve

### Opção 3: Gerar Logo Online
Ferramentas para criar logos:
- Canva (www.canva.com) — Arrastar e soltar
- Looka (www.looka.com) — IA gera logos
- Adobe Express (express.adobe.com)

Depois exporte como PNG e coloque em `frontend/img/`

## Recomendações de Tamanho

| Uso | Dimensões Recomendadas |
|-----|------------------------|
| Topbar | 280 x 60 px |
| Tela de login | 250 x 150 px |
| Tela de boas-vindas | 300 x 100 px |

## Formato Recomendado

- **SVG**: Melhor para logos (escalável, leve)
- **PNG**: Se a imagem tiver muitos detalhes
- **JPEG**: Evitar para logos

---

Logo Saidinha v1.0
