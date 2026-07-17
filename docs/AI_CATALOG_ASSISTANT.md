# AI Catalog Assistant

The assistant is implemented behind `POST /api/ai/catalog`.

- OpenAI is called only from the server.
- If `OPENAI_API_KEY` is missing, the endpoint falls back to server-side catalog search and returns `mode=search_only`.
- The assistant receives only authorized product records returned by `searchProductsForAssistant`.
- The model is not allowed to execute SQL, receive Supabase keys, modify prices, publish products, change inventory, or create final orders.
- Product recommendations must distinguish exact matches from alternatives and must not guarantee compatibility without source data.

Required activation variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_EMBEDDING_MODEL`
- Supabase catalog variables

