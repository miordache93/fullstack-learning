import express from 'express';

// STARTER: Keep only the generated process shell; the HTTP architecture is lesson work.
const host = process.env.HOST ?? 'localhost';
const port = Number(process.env.PORT ?? 3000);
const app = express();

// STARTER: Replace this generated-style route with explicit health and task boundaries.
app.get('/api', (_request, response) => {
  response.json({ message: 'Full-stack workshop starter' });
});

app.listen(port, host, () => {
  console.log(`[starter] API listening on http://${host}:${port}`);
});
