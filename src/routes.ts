export const initRoute = (app) => {
    app.get('/', (req, res) => {
        res.send('<h1>Weclome</h1>');
    });
}