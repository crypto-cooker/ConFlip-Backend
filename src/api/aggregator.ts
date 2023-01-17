import db from '../constants/ids';
import { fDateTime } from '../utils';
import { ResultType } from './round';

export enum PeriodType {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
}

// ==> Method responsible for get top 5 winners:
export const getTopPlayers = async (type: ResultType, period?: PeriodType) => {
    try {
        let days = 0;
        if (period === undefined) {
            const response = await db.query(`SELECT win_view.count, auth_wallets.address FROM \
            (SELECT COUNT(rounds.result), wallet_id FROM public.rounds WHERE rounds.result = '${type as string}' \
            GROUP BY wallet_id) AS win_view INNER JOIN auth_wallets ON auth_wallets.id = win_view.wallet_id \
            ORDER BY win_view.count DESC LIMIT 5`);
            return response.rows;
        }
        switch (period) {
            case PeriodType.DAY:
                days = 1;
                break;
            case PeriodType.WEEK:
                days = 7;
                break;
            case PeriodType.MONTH:
                days = 31;
                break;
        }
        const startTime = Date.now() - 86400000 * days;
        // console.log('Start DateTime:', startTime, new Date(startTime).toLocaleString());

        const response = await db.query(`SELECT win_view.count, auth_wallets.address FROM (SELECT COUNT(rounds.result), \
            wallet_id FROM public.rounds WHERE rounds.result = '${type as string}' AND rounds.timestamp > '${fDateTime(startTime)}' GROUP BY \
            wallet_id) AS win_view INNER JOIN auth_wallets ON auth_wallets.id = win_view.wallet_id ORDER BY win_view.count DESC LIMIT 5`);
        return response.rows;
    } catch (e) {
        console.log(e.message || e);
        return { err: e.message || JSON.stringify(e) };
    }
};

export const getRoundStatistics = async () => {
    try {
        const win_lose = await db.query(`SELECT COUNT(result_view.result), result_view.result FROM (SELECT * FROM rounds \
            ORDER BY rounds.timestamp DESC LIMIT 100) AS result_view GROUP BY result_view.result`);

        const kick_wipe = await db.query(`SELECT COUNT(result_view.flip_type), result_view.flip_type \
            FROM (SELECT * FROM rounds ORDER BY rounds.timestamp DESC LIMIT 100) AS result_view GROUP BY result_view.flip_type`);

        let status = {
            win_lose: {
                win: 0,
                lose: 0,
            },
            kick_wipe: {
                kick: 0,
                wipe: 0,
            }
        };

        win_lose.rows.map((row) => {
            if (row.result === 'win') {
                status.win_lose.win = parseInt(row.count);
                return;
            }
            if (row.result === 'lose') {
                status.win_lose.lose = parseInt(row.count);
                return;
            }
        });

        kick_wipe.rows.map((row) => {
            if (row.flip_type === 0) {
                status.kick_wipe.kick = parseInt(row.count);
                return;
            }
            if (row.flip_type === 1) {
                status.kick_wipe.wipe = parseInt(row.count);
                return;
            }
        })

        return status;
    } catch (e) {
        console.log(e.message || e);
        return { err: e.message || JSON.stringify(e) };
    }
};