# SpaceDash

Een automatisch ruimtevaartdashboard voor aankomende lanceringen, resultaten,
raketten, missies en livestreams.

## Databron

De eerste versie gebruikt de publieke Launch Library 2 API van The Space Devs.
De server haalt aankomende launches iedere vijf minuten opnieuw op en historische
missies ieder uur. Als de databron tijdelijk niet bereikbaar is, blijft een kleine
fallbackset zichtbaar.

## Lokaal starten

```bash
npm install
npm run dev
```

Open daarna `http://localhost:3000`.

## Deployen op Vercel

Importeer `swaggamezz/spacedash` in Vercel. Er zijn voor deze versie geen
environment variables of database nodig. Iedere push naar `main` wordt daarna
automatisch gedeployed.

## Volgende fases

- detailpagina's met rakettrappen, motoren, afmetingen en capaciteit;
- interactieve grondtrack/trajectweergave;
- favorieten en pushmeldingen;
- redundante databronnen en officiële webcastdetectie;
- launch-analyse en vergelijking met eerdere versies van dezelfde raket.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
