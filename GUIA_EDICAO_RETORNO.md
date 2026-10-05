# 📝 Guia: Edição de Retorno no Painel de Consultas

## 🎯 O que foi adicionado

Agora você pode **clicar em qualquer registro de saída** no painel de consultas para:
- 👀 **Ver detalhes completos**: data/hora de saída, motivo e data/hora de retorno
- ✏️ **Editar o retorno**: corrigir data, hora e adicionar observações
- 💾 **Salvar as alterações** com validação automática

## 📍 Onde encontrar

1. Acesse **Menu > Consulta**
2. Abra **Consultas** (módulo de relatórios)
3. Clique em um **aluno específico** para ver seu histórico de saídas
4. **Clique em qualquer card de saída** para abrir o popup

## 🖥️ Como usar

### Abrir Popup
```
1. Vá para o histórico de um aluno (Consulta > Clique no aluno)
2. Veja os cards com "🔗 Clique para ver detalhes e editar"
3. Clique em qualquer card
```

### Conteúdo do Popup
```
┌─────────────────────────────────┐
│ 📋 Detalhes da Saída      ✕     │
├─────────────────────────────────┤
│                                 │
│ 📤 Data e Hora de Saída        │
│ 15/10/2024 às 09:30            │
│                                 │
│ Motivo                          │
│ Consulta médica                 │
│                                 │
├─────────────────────────────────┤
│                                 │
│ 🔄 Data e Hora de Retorno      │
│ 15/10/2024 às 10:15            │
│                                 │
│ ⏱️ Duração                      │
│ 45min                           │
│                                 │
├─────────────────────────────────┤
│                                 │
│ ✏️ Editar Retorno              │
│                                 │
│ Data:  [15/10/2024]            │
│ Hora:  [10:15]                 │
│ Obs.:  [________________]       │
│                                 │
│ [💾 Salvar]  [❌ Cancelar]     │
│                                 │
└─────────────────────────────────┘
```

### Editar Retorno
```
1. Modifique a DATA (campo de data)
2. Modifique a HORA (campo de hora HH:MM)
3. (Opcional) Adicione observações
4. Clique em "💾 Salvar Alterações"
```

## ✅ Exemplo: Corrigir Retorno Errado

**Cenário**: Um aluno foi registrado como retornado às 10:15, mas na verdade retornou às 11:45.

**Passos**:
1. Abra o popup do registro
2. Veja que está marcado "10:15"
3. Clique no campo de Hora
4. Altere para "11:45"
5. Clique em "Salvar Alterações"
6. ✅ Histórico recarrega com a nova informação

## 📊 Impacto nos Dados

Quando você altera um retorno:
- A **duração** é recalculada automaticamente
- O **ranking de tempo fora** é atualizado
- Os **totalizadores** refletem a nova duração
- O **histórico do aluno** mostra o novo tempo

## 🔐 Permissões

Apenas **administradores** podem editar retornos (conforme matriz de permissões).

## ❌ Possíveis Erros

| Erro | Causa | Solução |
|------|-------|---------|
| "Data e hora obrigatórias" | Campos vazios | Preencha Data E Hora |
| "Nenhum retorno encontrado" | Saída sem retorno | Registre um retorno primeiro |
| "Acesso negado" | Não é admin | Solicite a um administrador |

## 🎓 Dica Importante

- **Sempre verifique** a duração após editar (não deixe retorno ANTES da saída)
- As **observações** ajudam a rastrear por que o retorno foi editado
- O **histórico fica intacto** - você está apenas corrigindo erros

---

**Data de criação**: 2024-10-05
**Versão**: 1.0
