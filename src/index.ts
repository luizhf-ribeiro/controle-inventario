import "reflect-metadata";
import express from "express";
import cors from "cors";
import path from "path";
import { AppDataSource } from "./data-source";

import authRoutes from "./routes/auth";
import equipamentosRoutes from "./routes/equipamentos";
import perifericosRoutes from "./routes/perifericos";
import componentesRoutes from "./routes/componentes";
import usuariosRoutes from "./routes/usuarios";

const app = express();

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (HTML, CSS, etc.)
const publicPath = path.resolve(__dirname, "../public");
app.use(express.static(publicPath));

console.log("📁 Servindo arquivos de:", publicPath);

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/equipamentos", equipamentosRoutes);
app.use("/api/perifericos", perifericosRoutes);
app.use("/api/componentes", componentesRoutes);
app.use("/api/usuarios", usuariosRoutes);

app.get("/api/test", (req, res) => res.json({ message: "API OK" }));

// Todas as rotas não-API servem o index.html (SPA-like)
app.get("*", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        console.log("✅ Banco de dados conectado com sucesso!");
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Erro ao conectar no banco:", err);
    });