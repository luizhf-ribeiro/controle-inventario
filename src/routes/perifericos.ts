import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Periferico } from "../entities/Periferico";
import { ILike } from "typeorm";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";

const router = Router();
const repo = AppDataSource.getRepository(Periferico);

const upload = multer({ dest: "uploads/" });

const limparTexto = (texto: string | undefined): string => {
    if (!texto) return "";
    return texto.replace(/^["']|["']$/g, "").trim();
};

// 🚀 ROTA DE IMPORTAÇÃO DE PERIFÉRICOS
router.post("/import", upload.fields([{ name: "file", maxCount: 1 }, { name: "perifericos", maxCount: 1 }]), async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const file = (files && files["file"] ? files["file"][0] : null) || 
                 (files && files["perifericos"] ? files["perifericos"][0] : null);

    if (!file) {
        return res.status(400).json({ message: "Nenhum arquivo de periféricos enviado para importação" });
    }

    const registros: any[] = [];
    let separador = ",";

    try {
        const primeiraLinha = fs.readFileSync(file.path, "utf8").split("\n")[0];
        if (primeiraLinha.includes(";")) separador = ";";
    } catch (err) {
        console.error("Erro ao ler cabeçalho do arquivo de periféricos:", err);
    }

    fs.createReadStream(file.path)
        .pipe(csv({ 
            separator: separador,
            mapHeaders: ({ header }) => header.replace(/^["']|["']$/g, "").trim()
        }))
        .on("data", (row: any) => { registros.push(row); })
        .on("end", async () => {
            try {
                let salvos = 0;

                if (registros.length === 0) {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                    return res.status(400).json({ message: "Arquivo de periféricos vazio ou inválido." });
                }

                for (const row of registros) {
                    const chaves = Object.keys(row);
                    const acharValor = (nomes: string[]): string => {
                        const chave = chaves.find(k => nomes.includes(k.toLowerCase()));
                        return chave ? limparTexto(row[chave]) : "";
                    };

                    const tipo = acharValor(["tipo"]);
                    if (!tipo) continue;

                    const periferico = new Periferico();
                    periferico.tipo = tipo;
                    periferico.marca = acharValor(["marca"]);
                    periferico.modelo = acharValor(["modelo"]);
                    periferico.status = acharValor(["status"]) || "Disponível";
                    periferico.usuarioResponsavel = acharValor(["usuario", "usuário", "usuarioresponsavel"]) || "ALMOXARIFADO";

                    await repo.save(periferico);
                    salvos++;
                }

                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                return res.status(200).json({ message: `${salvos} periféricos processados e salvos com sucesso.` });

            } catch (error: any) {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                return res.status(500).json({ message: "Erro interno ao salvar periféricos.", error: error.message });
            }
        });
});

// 🔑 Listar com proteção contra Query Params vazios
router.get("/", async (req: Request, res: Response) => {
    try {
        const { tipo, marca, modelo, nome, status, search } = req.query;
        const where: any = {};

        // Só adiciona o filtro se o parâmetro não for uma string vazia
        if (tipo && String(tipo).trim() !== "") where.tipo = ILike(`%${tipo}%`);
        if (marca && String(marca).trim() !== "") where.marca = ILike(`%${marca}%`);
        if (modelo && String(modelo).trim() !== "") where.modelo = ILike(`%${modelo}%`);
        if (nome && String(nome).trim() !== "") where.usuarioResponsavel = ILike(`%${nome}%`);
        if (status && String(status).trim() !== "") where.status = ILike(`%${status}%`);
        if (search && String(search).trim() !== "") where.tipo = ILike(`%${search}%`);

        const perifericos = await repo.find({
            where: Object.keys(where).length > 0 ? where : undefined,
            order: { id: "DESC" }
        });

        res.json(perifericos);
    } catch (error) {
        console.error("Erro ao listar periféricos:", error);
        res.status(500).json({ message: "Erro ao buscar periféricos" });
    }
});

// Buscar ID específico
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const item = await repo.findOneBy({ id });
        if (!item) return res.status(404).json({ message: "Não encontrado" });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar periférico" });
    }
});

// Criar Individual
router.post("/", async (req: Request, res: Response) => {
    try {
        res.status(201).json(await repo.save(repo.create(req.body)));
    } catch (error: any) {
        res.status(500).json({ message: "Erro ao cadastrar" });
    }
});

// Atualizar Individual
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const item = await repo.findOneBy({ id: parseInt(req.params.id) });
        if (!item) return res.status(404).json({ message: "Não encontrado" });
        res.json(await repo.save(repo.merge(item, req.body)));
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar" });
    }
});

// Deletar Individual
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        await repo.delete(parseInt(req.params.id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar" });
    }
});

export default router;