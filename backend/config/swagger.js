const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Todo",
      version: "1.0.0",
      description: "Dokumentasi API Todo (Express + MongoDB)",
    },
    servers: [
      //   { url: 'https://apitodo.shiddiqsm.my.id', description: 'Production' },
      { url: "http://localhost:3000", description: "Local" },
    ],
    components: {
      schemas: {
        Todo: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665f1c2e8a1b2c3d4e5f6a7b" },
            title: { type: "string", example: "Belajar Swagger" },
            completed: { type: "boolean", example: false },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-11-12T08:30:00.000Z",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string", example: "Tugas tidak ditemukan" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"], // lokasi file yang berisi komentar @swagger
};

module.exports = swaggerJsdoc(options);
