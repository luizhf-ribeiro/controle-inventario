"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const data_source_1 = require("./data-source");
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const equipamentos_1 = __importDefault(require("./routes/equipamentos"));
const perifericos_1 = __importDefault(require("./routes/perifericos"));
const componentes_1 = __importDefault(require("./routes/componentes"));
const usuarios_1 = __importDefault(require("./routes/usuarios"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Servir arquivos estáticos (HTML, CSS, etc.)
const publicPath = path_1.default.resolve(__dirname, "../public");
app.use(express_1.default.static(publicPath));
console.log("📁 Servindo arquivos de:", publicPath);
// Rotas da API
app.use("/api/auth", auth_js_1.default);
app.use("/api/equipamentos", equipamentos_1.default);
app.use("/api/perifericos", perifericos_1.default);
app.use("/api/componentes", componentes_1.default);
app.use("/api/usuarios", usuarios_1.default);
app.get("/api/test", (req, res) => res.json({ message: "API OK" }));
// Todas as rotas não-API servem o index.html (SPA-like)
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(publicPath, "index.html"));
});
const PORT = process.env.PORT || 3000;
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("✅ Banco de dados conectado com sucesso!");
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error("❌ Erro ao conectar no banco:", err);
});
