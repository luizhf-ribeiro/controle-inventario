import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    // Se existir DATABASE_URL (no Render), ele usa a URL. 
    // Se não existir, ele usa as configurações individuais (seu PC).
    url: process.env.DATABASE_URL, 
    host: !process.env.DATABASE_URL ? (process.env.DB_HOST || "db") : undefined,
    port: !process.env.DATABASE_URL ? (Number(process.env.DB_PORT) || 5432) : undefined,
    username: !process.env.DATABASE_URL ? (process.env.DB_USER || "admin") : undefined,
    password: !process.env.DATABASE_URL ? (process.env.DB_PASS || "hepta123") : undefined,
    database: !process.env.DATABASE_URL ? (process.env.DB_NAME || "inventario") : undefined,
    
    // Configuração extra para o Supabase/Render não recusar a conexão
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    
    synchronize: true,
    logging: false,
    // Mudamos para ler tanto .ts quanto .js (importante para o Docker)
    entities: [process.env.NODE_ENV === 'production' ? "dist/entities/*.js" : "src/entities/*.ts"],
});