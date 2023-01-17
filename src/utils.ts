import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ADMIN_KEY, connection } from "./constants/ids";
import { format } from 'date-fns';

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getBalance = async () => {
    console.log(`  Get current admin balance ${ADMIN_KEY.toString()}`);
    try {
        const balance = await connection.getBalance(ADMIN_KEY);
        console.log(` Current balance is ${balance / LAMPORTS_PER_SOL}`);
        return balance / LAMPORTS_PER_SOL;
    } catch (e) {
        console.log(e);
        return 0;
    };
}

export function fDateTime(date) {
    return format(new Date(date), 'yyyy-MM-dd HH:mm');
}
