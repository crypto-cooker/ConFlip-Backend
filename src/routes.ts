// import { routeDeposit, routeRegister, routeWithdraw, routeInvest, routeDivest, routeGetBankroll } from "./api";

export const initRoute = (app) => {
    app.get('/', (req, res) => {
        res.send('<h1>Weclome</h1>');
    });
      
    // app.post('/register', routeRegister);
    // app.post('/deposit', routeDeposit);
    // app.post('/invest', routeInvest);
    // app.post('/divest', routeDivest);
    // app.post('/withdraw', routeWithdraw);
    // app.post('/bankroll', routeGetBankroll);
}