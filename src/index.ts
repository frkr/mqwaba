const url = 'https://mqwaba.mundial.workers.dev';

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        return HTTP_UNPROCESSABLE_ENTITY();
    },
    async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
        for (const msg of batch.messages) {
            try {

                const data = msg.body;
                const waba = data.entry[0].changes[0].value.metadata.phone_number_id;
                const tipoMsg = data.entry[0].changes[0].value.messages[0].type;

                if (waba && tipoMsg) {

                    if (waba === env.CELL_TAKING || waba === env.CELL_TAKING2) {
                        await env.mqgrgpt.send(data, {
                            contentType: "json",
                        });
                        continue;
                    }

                    if (waba === env.CELL_WURA || waba === env.CELL_BARDI) {
                        await env.wchatmq.send(data, {
                            contentType: "json",
                        });
                        continue;
                    }

                    await env.mqwgeral.send(data, {
                        contentType: "json",
                    });
                }
            } catch (e) {
                console.error("queue", e, e.stack);
            } finally {
                msg.ack();
            }
        }
    },
};

const HTTP_UNPROCESSABLE_ENTITY = () => new Response('422 Unprocessable Content', {status: 422});
