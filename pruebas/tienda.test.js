require('dotenv').config();
const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1','8.8.8.8']);

beforeAll(async () => {
    const uriManual = "mongodb+srv://admin:admin12345@cluster0.lcbat2z.mongodb.net/ProyectoFinal?appName=Cluster0"; 
    try {
        await mongoose.connect(uriManual);
        console.log("¡CONEXIÓN MANUAL EXITOSA!");
    } catch (err) {
        console.log("EL ERROR ES DE RED/FIREWALL:", err.message);
    }
}, 30000);

describe('Pruebas de Tienda (Productos y Categorías)', () => {
  
  it('Debería no poder crear una nueva categoría sin token admin', async () => {
    const res = await request(app)
      .post('/api/category/createCategory')
      .send({ nombre: "Electrónica" });
    
    expect(res.statusCode).toBe(401);
  });

  it('Debería listar todos los productos', async () => {
    const res = await request(app).get('/api/products/viewProducts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});