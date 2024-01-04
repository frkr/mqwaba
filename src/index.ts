const url = 'https://mqwaba.mundial.workers.dev';

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        return HTTP_UNPROCESSABLE_ENTITY();
    },
    async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
        for (const msg of batch.messages) {
            try {

                const data = msg.body;
                let tipoMsg = null;
                let content = null;
                try {
                    tipoMsg = data.entry[0].changes[0].value.messages[0].type;
                    content = JSON.stringify(msg.body);
                } catch (e) {
                }

                if (tipoMsg) {
                    const post = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: content,
                    };

                    //region GRGPT
                    try {
                        if (data.entry[0].changes[0].value.metadata.phone_number_id === env.CELL_TAKING) {
                            await env.mqgrgpt.send(data, {
                                contentType: "json",
                            });
                            continue;
                        }
                    } catch (e3) {
                    }
                    //endregion

                    //region Bruno
                    try {
                        if (data.entry[0].changes[0].value.metadata.phone_number_id === env.CELL_BARDI) {
                            await (await env.bardi.fetch(url, post)).text();
                            continue;
                        }
                    } catch (e3) {
                    }
                    //endregion

                    try {
                        await env.mqwgeral.send(data, {
                            contentType: "json",
                        });
                    } catch (e3) {
                        console.error("mqwgeral", e3, e3.stack);
                    }
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
