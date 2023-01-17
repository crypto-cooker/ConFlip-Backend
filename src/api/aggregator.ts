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
        const response = await db.query(`SELECT win_view.count, auth_wallets.address FROM \
        (SELECT COUNT(rounds.result), wallet_id FROM public.rounds WHERE rounds.result = '' \
        GROUP BY wallet_id) AS win_view INNER JOIN auth_wallets ON auth_wallets.id = win_view.wallet_id \
        ORDER BY win_view.count DESC LIMIT 5`);
        return response.rows;
    } catch (e) {
        console.log(e.message || e);
        return { err: e.message || JSON.stringify(e) };
    }
};