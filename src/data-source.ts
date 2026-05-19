import "reflect-metadata";
import { DataSource } from "typeorm";
import { Ativo } from "./entities/Ativo";
import { Componente } from "./entities/Componente";
import { Equipamento } from "./entities/Equipamento";
import { Periferico } from "./entities/Periferico";
import { Usuario } from "./entities/Usuario";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    synchronize: false,
    logging: false,
    entities: [Ativo, Componente, Equipamento, Periferico, Usuario],
    migrations: [],
    subscribers: [],
});