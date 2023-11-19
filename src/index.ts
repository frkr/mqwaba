const url = 'https://mqwaba.mundial.workers.dev';

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        return HTTP_UNPROCESSABLE_ENTITY();
    },
    async queue(batch: MessageBatch<String>, env: Env): Promise<void> {
        for (const msg of batch.messages) {
            try {

                const content = await (await env.MQPOSTR2.get(msg.body + ".txt")).text();

                //region Decode
                let data: any = null;
                try {
                    data = JSON.parse(content);
                } catch (e) {
                }

                let tipoMsg = null;
                try {
                    tipoMsg = data.entry[0].changes[0].value.messages[0].type;
                } catch (e) {
                }
                //endregion

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
                            await (await env.grgpt.fetch(url, post)).text();
                            continue;
                        }
                    } catch (e3) {
                    }
                    //endregion

                    //region Agilista - Julio
                    try {
                        if (data.entry[0].changes[0].value.metadata.phone_number_id === env.CELL_AGILISTA) {
                            await (await env.julio.fetch(url, post)).text();
                            continue;
                        }
                    } catch (e3) {
                    }
                    //endregion

                    //region Ricardo
                    try {
                        if (data.entry[0].changes[0].value.metadata.phone_number_id === env.CELL_USA) {
                            await (await env.ricardo.fetch(url, post)).text();
                            continue;
                        }
                    } catch (e3) {
                    }
                    //endregion

                    //region Bardi
                    try {
                        if (data.entry[0].changes[0].value.metadata.phone_number_id === '149399338249678') {
                            await (await env.bardi.fetch(url, post)).text();
                            continue;
                        }
                    } catch (e3) {
                    }
                    //endregion

                    //region PCAST
                    try {
                        if (data.entry[0].changes[0].value.metadata.phone_number_id === '153057757881230') {
                            await (await env.gabriel.fetch(url, post)).text();
                            continue;
                        }
                    } catch (e3) {
                    }
                    //endregion

                    try {
                        await (await env.mlearn.fetch(url, post)).text();
                    } catch (e3) {
                        console.error("mlearn", e3, e3.stack);
                    }
                }
            } catch (e) {
                console.error("queue", e, e.stack);
            } finally {
                try {
                    await env.MQPOSTR2.delete(msg.body + ".txt");
                } catch (e) {
                }
                msg.ack();
            }
        }
    },
};

const HTTP_UNPROCESSABLE_ENTITY = () => new Response('422 Unprocessable Content', {status: 422});
