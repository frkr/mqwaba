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
                const content = JSON.stringify(msg.body);


                if (waba && tipoMsg && content) {
                    const post = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: content,
                    };

                    if (waba === env.CELL_TAKING) {
                        await env.mqgrgpt.send(data, {
                            contentType: "json",
                        });
                        continue;
                    }

                    if (waba === env.CELL_BARDI) {
                        try {
                            await (await env.bardi.fetch(url, post)).text();
                        } catch (e3) {
                        }
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
