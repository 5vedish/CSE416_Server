import express from 'express';
import { db } from '../db';
import { hashPassword, verifyResetRequest } from '../utils/auth';

import { nanoid } from 'nanoid';
import { ServerClient, TemplatedMessage } from 'postmark';

const passwordResetRouter = express.Router();

const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN!);

passwordResetRouter.post('/', async (req, res) => {
    const { email } = req.body;
    const user = await db.user.findFirst({
        where: { email },
    });
    if (!user) {
        res.sendStatus(404);
        return;
    }
    const resetToken = nanoid();
    await db.user.update({
        where: { id: user.id },
        data: {
            passwordResets: {
                create: {
                    token: resetToken,
                },
            },
        },
    });

    postmarkClient.sendEmailWithTemplate({
        From: 'support@qiz-client.herokuapp.com',
        To: user.email,
        TemplateAlias: 'password-reset',
        TemplateModel: {
            product_url: 'https://qiz-client.herokuapp.com',
            product_name: 'Qiz',
            action_url: `https://qiz-client.herokuapp.com/reset_password?token=${resetToken}`,
        },
    });
    res.json({ token: resetToken });
});

passwordResetRouter.put('/', async (req, res) => {
    const { newPassword, token } = req.body;

    const resetRequest = await db.passwordReset.findFirst({
        where: { token },
        include: {
            user: true,
        },
    });

    if (!resetRequest) {
        res.sendStatus(404);
        return;
    }

    if (!verifyResetRequest(resetRequest.createdAt)) {
        await db.passwordReset.delete({ where: { token } });
        res.sendStatus(401);
        return;
    }

    const newPasswordHashed = await hashPassword(newPassword);

    await db.user.update({
        where: { id: resetRequest.user.id },
        data: {
            password: newPasswordHashed,
        },
    });

    await db.passwordReset.delete({ where: { token } });
    res.sendStatus(200);
});

export { passwordResetRouter };
