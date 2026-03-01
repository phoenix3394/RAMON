const { setHttpCallback } = require('@citizenfx/http-wrapper');
const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();
const resName = GetCurrentResourceName();

// Middleware for API Key Check
app.use(async (ctx: any, next: any) => {
    const internalKey = exports[resName].GetApiKey();
    const providedKey = ctx.get('x-api-key');

    if (!providedKey || providedKey !== internalKey) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized: Invalid API Key' };
        return;
    }
    await next();
});

// Route: Get User
router.get('/user/:identifier', async (ctx: any) => {
    const { identifier } = ctx.params;
    
    try {
        const result = await exports.oxmysql.query_async(
            'SELECT * FROM users WHERE identifier = ? LIMIT 1',
            [identifier]
        );

        if (result && result.length > 0) {
            ctx.body = { status: 'success', data: result[0] };
        } else {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
        }
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: 'Database error' };
    }
});

app.use(router.routes()).use(router.allowedMethods());
setHttpCallback(app.callback());
