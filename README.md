This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Supabase setup

The app uses Supabase Auth and row-level security for account-specific data.

1. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to
   `.env.local`. See [`.env.example`](./.env.example).
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL
   Editor. This script is for a new project; it does not migrate existing data.
3. Start the app and create an account at `/sign-up`:

```bash
npm run dev
```

Open [http://localhost:3000/sign-up](http://localhost:3000/sign-up). If email
confirmation is enabled in Supabase, confirm the account before signing in.
Make sure `http://localhost:3000` is an allowed redirect URL in the Supabase
Auth URL Configuration.

## Development

```bash
npm run lint
npm run build
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
