

# Plano: Integração Google Calendar OAuth

## Resumo

Implementar a sincronização bidirecional com o Google Calendar, permitindo que o corretor conecte sua conta Google e sincronize eventos de visita automaticamente.

## Passo a passo para gerar as credenciais OAuth no Google Cloud Console

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto (ex: "ImobiAI")
3. Vá em **APIs & Services > Library** e ative a **Google Calendar API**
4. Vá em **APIs & Services > OAuth consent screen**:
   - Tipo: **External**
   - Preencha nome do app ("ImobiAI"), email de suporte
   - Em **Authorized domains**, adicione: `lovable.app`
   - Escopos: adicione `https://www.googleapis.com/auth/calendar` e `https://www.googleapis.com/auth/calendar.events`
5. Vá em **APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID**:
   - Tipo: **Web application**
   - **Authorized redirect URIs**: adicione `https://jujpairnnytqvlaedsvi.supabase.co/auth/v1/callback`
   - Anote o **Client ID** e **Client Secret**

## Implementacao tecnica

### 1. Salvar secrets
- Solicitar ao usuario o `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` via ferramenta `add_secret`

### 2. Edge function: `google-calendar-callback`
- Recebe o authorization code do Google apos redirect
- Troca por access_token e refresh_token
- Salva tokens na tabela `profiles` (novos campos: `google_access_token`, `google_refresh_token`, `google_token_expires_at`)
- Marca `google_calendar_connected = true`

### 3. Edge function: `google-calendar-sync`
- Usa refresh_token para obter access_token atualizado
- Busca eventos da tabela `eventos_agenda` com tipo "visita"
- Cria/atualiza eventos no Google Calendar via API
- Salva `google_event_id` de volta na tabela (campo ja existe)

### 4. Edge function: `google-calendar-auth`
- Gera a URL de autorizacao OAuth com os escopos corretos
- Retorna URL para o frontend redirecionar o usuario

### 5. Migracao de banco
- Adicionar colunas em `profiles`: `google_access_token` (text), `google_refresh_token` (text), `google_token_expires_at` (timestamptz)

### 6. Frontend (ConfigPage)
- Ao clicar em "Google Agenda", chamar a edge function `google-calendar-auth` e redirecionar
- Tratar o retorno do callback (page ou route que processa o code)
- Mostrar status "Conectado" / "Desconectar"

### 7. Sincronizacao automatica
- Ao criar/editar evento do tipo "visita", chamar `google-calendar-sync` para criar no Google Calendar

## Arquitetura

```text
[ConfigPage] --click--> [google-calendar-auth EF] --> redirect Google OAuth
Google OAuth --callback--> [google-calendar-callback EF] --> salva tokens no DB
[NewEventoDialog] --criar visita--> [google-calendar-sync EF] --> Google Calendar API
```

