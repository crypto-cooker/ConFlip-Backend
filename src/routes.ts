import { PeriodType, getTopPlayers } from './api/aggregator';
import { ResultType } from './api/round';

export const initRoute = (app) => {
    app.get('/', (req, res) => {
        res.send('<h1>Weclome</h1>');
    });

    app.get('/top-players', async (req, res) => {
        const { period } = req.query;

        console.log('-- @ Get Top Player Request --', period);

        let periodType = undefined;
        switch (period) {
            case 'day':
                periodType = PeriodType.DAY;
                break;
            case 'week':
                periodType = PeriodType.WEEK;
                break;
            case 'month':
                periodType = PeriodType.MONTH;
                break;
        }

        const winners = await getTopPlayers(ResultType.WIN, periodType);
        const losers = await getTopPlayers(ResultType.LOSE, periodType);

        res.send({ winners, losers });
    });
}