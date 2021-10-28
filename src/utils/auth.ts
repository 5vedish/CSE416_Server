import { hash, compare } from 'bcryptjs';

import { add, isFuture } from 'date-fns';

const hashPassword = async (password: string) => {
    return await hash(password, 16);
};

const checkPassword = async (password: string, hash: string) => {
    return await compare(password, hash);
};

const verifyResetRequest = (createdAt: Date) => {
    return isFuture(add(createdAt, { days: 1 }));
};

export { hashPassword, checkPassword, verifyResetRequest };
