const request = require('supertest');
const {app} = require('../src/server');


describe('Dice route...', () => {
    it('rolls a D6 by default.', async () => {
        const response = await request(app).get('/dice');
        expect(response.statusCode).toEqual(200);
        expect(response.headers["content-type"]).toEqual(expect.stringContaining('json'));
		expect(response.body.result).toBeGreaterThan(0);
        expect(response.body.result).toBeLessThanOrEqual(6);
    });
});