import { hash, compare } from 'bcryptjs';

import { add, isFuture } from 'date-fns';

const hashPassword = async (password: string) => {
    return hash(password, 12);
};

const checkPassword = async (password: string, hash: string) => {
    return compare(password, hash);
};

const verifyResetRequest = (createdAt: Date) => {
    return isFuture(add(createdAt, { days: 1 }));
};

const verifySession = (createdAt: Date) => {
    return isFuture(add(createdAt, { hours: 1 }));
};

const generateSessionExpiry = (createdAt: Date) => {
    return add(createdAt, { hours: 1 });
};

export {
    hashPassword,
    checkPassword,
    verifyResetRequest,
    verifySession,
    generateSessionExpiry,
};
