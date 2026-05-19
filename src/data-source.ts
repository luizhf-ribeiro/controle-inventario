import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { Equipamento } from "./entities/Equipamento"; // Ajuste o caminho real das suas entidades se necessário

// Carrega as variáveis do arquivo .env
dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "postgres",
    synchronize: true, // Defina como false em produção
    logging: false,
    entities: [Equipamento], // Certifique-se de listar todas as suas entidades aqui
    migrations: [],
    subscribers: [],
});