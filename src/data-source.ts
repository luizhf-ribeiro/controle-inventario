import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

// Importando todas as entidades
import { Ativo } from "./entities/Ativo";
import { Componente } from "./entities/Componente";
import { Equipamento } from "./entities/Equipamento";
import { Periferico } from "./entities/Periferico";
import { Usuario } from "./entities/Usuario";

// Carrega variáveis de ambiente o mais cedo possível
dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,

    // Configurações locais (só usadas se não tiver DATABASE_URL)
    host: !process.env.DATABASE_URL ? (process.env.DB_HOST || "db") : undefined,
    port: !process.env.DATABASE_URL ? (Number(process.env.DB_PORT) || 5432) : undefined,
    username: !process.env.DATABASE_URL ? (process.env.DB_USER || "admin") : undefined,
    password: !process.env.DATABASE_URL ? (process.env.DB_PASS || "hepta123") : undefined,
    database: !process.env.DATABASE_URL ? (process.env.DB_NAME || "inventario") : undefined,

    // Essencial para Supabase no Render
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,

    synchronize: true,
    logging: false,

    entities: [
        Ativo,
        Componente,
        Equipamento,
        Periferico,
        Usuario
    ],
});