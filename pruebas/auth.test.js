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

describe('Pruebas del Registro/Login', () => {
  it('Debería guardar un mensaje de registro exitoso', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        nombre: "Monica",
        apellido: 'Garcia',
        username: 'knfoigarcia',
        email: "2322@ejemplo.com",
        password: "1234567890",
        role: "user"
      });

    expect(res.statusCode).toBe(201);
  }, 10000);

  it('Debería fallar si falta o esta mal el correo electrónico', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        nombre: "Monica",
        apellido: 'Garcia',
        username: 'Egarcia',
        email: "2322@ejemplo.com",
        password: "1234567890",
        role: "user"
      });

    expect(res.statusCode).toBe(400);
  }, 10000);

  it.only('Debería fallar si no es correcto el correo electrónico en el Login', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        identifier: "usuario_Falso@gmail.com",
        password: "password-falsa"
      });
      if (res.statusCode === 404) {
        console.log("--- DEBUG INFO ---");
        console.log("Cuerpo que devuelve el 404:", res.text); 
        console.log("Ruta intentada:", res.req.path);
        console.log("------------------");
    }
    expect(res.statusCode).toBe(404);
  }, 10000);
});

afterAll(async () => {
  await mongoose.connection.close();
});