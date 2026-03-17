

# Plano: Corrigir erros de build e funcionalidades

## Problemas identificados

1. **Coluna `whatsapp_notification_number` nao existe** na tabela `profiles` -- o codigo tenta salvar/ler esse campo mas ele nunca foi criado. Erro 400 confirmado nos network requests.

2. **Erro TS em `NewEventoDialog.tsx`** -- tenta acessar `notif_visitas` de um select que inclui `whatsapp_notification_number` (coluna inexistente), causando erro de tipo cascata.

3. **Erro TS em `AssistantPage.tsx`** -- referencia direta a `SpeechRecognition` sem usar `window.SpeechRecognition`. Precisa de cast via `as any` ou declaracao de tipo.

4. **Google Calendar OAuth 403** -- O redirect URI configurado no `google-calendar-auth` edge function aponta para `.../functions/v1/google-calendar-callback`, que e o correto. O problema e que no Google Cloud Console, o **Authorized redirect URI** precisa ser exatamente esse valor. Alem disso, o app precisa ter o email do usuario adicionado como "Test user" enquanto estiver em modo Testing.

## Alteracoes

### 1. Migracao de banco
Adicionar coluna `whatsapp_notification_number` (text, nullable) na tabela `profiles`.

### 2. NewEventoDialog.tsx
Corrigir o select para usar apenas colunas existentes: trocar `whatsapp_notification_number` por buscar de `profiles` com campos corretos apos a migracao.

### 3. AssistantPage.tsx
Corrigir referencias a `SpeechRecognition` usando `(window as any).SpeechRecognition` e tipagem com `any` para evitar erros TS.

### 4. Guia Google Cloud Console
O redirect URI que deve ser adicionado no Google Cloud Console e:
```
https://jujpairnnytqvlaedsvi.supabase.co/functions/v1/google-calendar-callback
```

Passos para o usuario:
- Em **APIs & Services > Credentials**, editar o OAuth Client ID
- Em **Authorized redirect URIs**, garantir que a URL acima esta la (nao a `/auth/v1/callback`)
- Em **OAuth consent screen > Test users**, adicionar seu email (`wm@lynq.ag`)

