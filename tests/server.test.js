const request = require('supertest');
const {app} = require('../src/server');


describe('Server homepage...', () => {
    it('shows a Hello message.', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toEqual(200);
		expect(response.text).toEqual(expect.stringContaining("Hello"));

    });
});