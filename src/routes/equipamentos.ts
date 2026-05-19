import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Equipamento } from "../entities/Equipamento";
import { ILike } from "typeorm";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";

const router = Router();
const repo = AppDataSource.getRepository(Equipamento);

// Configuração do Multer para aceitar uploads temporários
const upload = multer({ dest: "uploads/" });

// Interface para mapeamento flexível das colunas do CSV
interface CsvRow {
    Patrimonio?: string;
    patrimonio?: string;
    Tipo?: string;
    tipo?: string;
    Marca?: string;
    marca?: string;
    Modelo?: string;
    modelo?: string;
    Serial?: string;
    serial?: string;
    serialNumber?: string;
    Localizacao?: string;
    localizacao?: string;
    Usuario?: string;
    usuario?: string;
    usuarioResponsavel?: string;
    Status?: string;
    status?: string;
}

// 🚀 ROTA DE IMPORTAÇÃO: Aceita as chaves 'file' ou 'equipamentos' de forma flexível
router.post("/import", upload.fields([{ name: "file", maxCount: 1 }, { name: "equipamentos", maxCount: 1 }]), async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Captura o arquivo independentemente de qual chave o frontend utilizou
    const file = (files && files["file"] ? files["file"][0] : null) || 
                 (files && files["equipamentos"] ? files["equipamentos"][0] : null);

    if (!file) {
        console.error("❌ [IMPORT] Nenhum arquivo processado pelo Multer.");
        return res.status(400).json({ message: "Nenhum equipamento enviado para importação" });
    }

    console.log(`📂 [IMPORT] Arquivo recebido em produção: ${file.originalname}`);

    const registros: CsvRow[] = [];
    let separador = ",";

    // Detecção automática de separador (Vírgula ou Ponto e Vírgula)
    try {
        const primeiraLinha = fs.readFileSync(file.path, "utf8").split("\n")[0];
        if (primeiraLinha.includes(";")) {
            separador = ";";
            console.log("ℹ️ [IMPORT] Delimitador detectado: PONTO E VÍRGULA (;)");
        } else {
            console.log("ℹ️ [IMPORT] Delimitador detectado: VÍRGULA (,)");
        }
    } catch (err) {
        console.error("❌ [IMPORT] Falha ao analisar cabeçalho do arquivo:", err);
    }

    // Processamento do fluxo do arquivo CSV
    fs.createReadStream(file.path)
        .pipe(csv({ separator: separador }))
        .on("data", (row: CsvRow) => {
            registros.push(row);
        })
        .on("end", async () => {
            try {
                let criadosOuAtualizados = 0;
                console.log(`📊 [IMPORT] Total de linhas extraídas do CSV: ${registros.length}`);

                if (registros.length === 0) {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                    return res.status(400).json({ message: "O arquivo CSV está vazio ou possui formatação incompatível." });
                }

                for (const row of registros) {
                    const patrimonio = row.Patrimonio || row.patrimonio;
                    
                    if (!patrimonio) {
                        console.warn("⚠️ [IMPORT] Linha ignorada por ausência da coluna 'Patrimonio':", row);
                        continue;
                    }

                    // Busca se o registro com o patrimônio fornecido já existe no banco
                    let equipamento = await repo.findOneBy({ patrimonio: patrimonio.trim() });

                    if (!equipamento) {
                        equipamento = new Equipamento();
                    }

                    equipamento.patrimonio = patrimonio.trim();
                    equipamento.tipo = row.Tipo || row.tipo || "Desktop";
                    equipamento.marca = row.Marca || row.marca || "";
                    equipamento.modelo = row.Modelo || row.modelo || "";
                    equipamento.serialNumber = row.Serial || row.serial || row.serialNumber || "";
                    equipamento.localizacao = row.Localizacao || row.localizacao || "Almoxarifado";
                    equipamento.usuarioResponsavel = row.Usuario || row.usuario || row.usuarioResponsavel || "ALMOXARIFADO";
                    equipamento.status = row.Status || row.status || "Offline";

                    await repo.save(equipamento);
                    criadosOuAtualizados += 1;
                }

                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

                if (criadosOuAtualizados === 0) {
                    return res.status(400).json({ message: "Nenhum equipamento válido pôde ser extraído do arquivo CSV. Verifique os cabeçalhos." });
                }

                console.log(`✅ [IMPORT] Sucesso! ${criadosOuAtualizados} ativos salvos no banco de dados.`);
                return res.status(200).json({ 
                    message: `${criadosOuAtualizados} equipamentos processados e salvos com sucesso.` 
                });

            } catch (error: any) {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                console.error("❌ [IMPORT] Erro interno durante salvamento no banco:", error);
                return res.status(500).json({ message: "Erro ao processar e salvar dados no banco de dados.", error: error.message });
            }
        })
        .on("error", (error: Error) => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            console.error("❌ [IMPORT] Falha crítica no Stream do CSV:", error);
            return res.status(500).json({ message: "Falha crítica na leitura estrutural do arquivo CSV." });
        });
});

// Listar todos com filtros aplicados
router.get("/", async (req: Request, res: Response) => {
    try {
        const { tipo, nome, status, search } = req.query;
        const where: any = {};

        if (tipo) where.tipo = ILike(`%${tipo}%`);
        if (nome) where.usuarioResponsavel = ILike(`%${nome}%`);
        if (status) where.status = ILike(`%${status}%`);
        if (search) where.tipo = ILike(`%${search}%`);

        const equipamentos = await repo.find({
            where: Object.keys(where).length > 0 ? where : undefined,
            order: { id: "DESC" }
        });

        res.json(equipamentos);
    } catch (error) {
        console.error("Erro ao listar:", error);
        res.status(500).json({ message: "Erro ao listar equipamentos" });
    }
});

// Buscar por ID específico
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const equipamento = await repo.findOneBy({ id });

        if (!equipamento) {
            return res.status(404).json({ message: "Equipamento não encontrado" });
        }

        res.json(equipamento);
    } catch (error) {
        console.error("Erro ao buscar por ID:", error);
        res.status(500).json({ message: "Erro interno ao buscar equipamento" });
    }
});

// Criar manualmente
router.post("/", async (req: Request, res: Response) => {
    try {
        const novo = repo.create(req.body);
        res.status(201).json(await repo.save(novo));
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(409).json({ message: "Patrimônio já existe!" });
        } else {
            res.status(500).json({ message: "Erro ao cadastrar" });
        }
    }
});

// Atualizar existente
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const item = await repo.findOneBy({ id });

        if (!item) {
            return res.status(404).json({ message: "Equipamento não encontrado" });
        }

        const atualizado = await repo.save(repo.merge(item, req.body));
        res.json(atualizado);
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        res.status(500).json({ message: "Erro ao atualizar equipamento" });
    }
});

// Remover do inventário
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        await repo.delete(parseInt(req.params.id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar" });
    }
});

export default router;