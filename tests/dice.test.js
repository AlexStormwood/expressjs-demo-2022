const request = require('supertest');
const {app} = require('../src/server');


describe('Dice route...', () => {
    it('rolls a D6 by default.', async () => {
        const response = await request(app).get('/dice');
        expect(response.statusCode).toEqual(200);
		expect(response.text).toBeGreaterThan(0);
        expect(response.text).toBeLessThanOrEqual(6);
    });
});