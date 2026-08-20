# M&M Fotografias

Loja de fotografias em Next.js 16, Supabase e Mercado Pago.

## Preparação local

1. Copie `.env.example` para `.env.local` e preencha apenas com credenciais próprias.
2. Instale com `npm ci`.
3. Rode `npm run dev`.

## Publicação da v1.0

Antes de publicar, revise e execute `supabase/migrations/202608200001_v1_customer_security.sql` no SQL Editor. A migration cria perfis, adiciona `orders.user_id`, vincula pedidos antigos por e-mail, configura RLS e torna `originals` privado. Ela não apaga nem move objetos.

Defina na Vercel as variáveis de `.env.example`. Secrets jamais devem usar o prefixo `NEXT_PUBLIC_`.

Para habilitar e-mail, verifique um domínio/remetente no Resend e configure `RESEND_API_KEY` e `EMAIL_FROM`. Sem ambas, compra e pagamento continuam funcionando e o envio é ignorado.

Promova o primeiro administrador manualmente, substituindo o e-mail:

```sql
update public.profiles p set role = 'admin'
from auth.users u where p.id = u.id and lower(u.email) = lower('SEU_EMAIL');
```

No Mercado Pago, mantenha `/api/webhooks/mercadopago` e configure a assinatura em `MERCADO_PAGO_WEBHOOK_SECRET`.

## Verificação

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Após o deploy, faça um teste real de baixo valor: cadastro, perfil, carrinho, PIX, webhook, Minha Conta e downloads. Teste também pedido pendente/cancelado e acesso de cliente comum a `/admin`.
