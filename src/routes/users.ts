import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Usuario } from "../entities/Usuario";
import { ILike } from "typeorm";

const router = Router();
const repo = AppDataSource.getRepository(Usuario);

// 🚀 LISTAR USUÁRIOS COM FILTROS TRATADOS CONTRA STRINGS VAZIAS E PARAMETROS NULOS
router.get("/", async (req: Request, res: Response) => {
    try {
        const { nome, email, cargo, search } = req.query;
        const where: any = {};

        // Só injeta o filtro se o parâmetro não vier em branco, evitando erro 500 no Postgres
        if (nome && String(nome).trim() !== "") where.nome = ILike(`%${nome}%`);
        if (email && String(email).trim() !== "") where.email = ILike(`%${email}%`);
        if (cargo && String(cargo).trim() !== "") where.cargo = ILike(`%${cargo}%`);
        if (search && String(search).trim() !== "") where.nome = ILike(`%${search}%`);

        const usuarios = await repo.find({
            where: Object.keys(where).length > 0 ? where : undefined,
            order: { nome: "ASC" }
        });

        res.json(usuarios);
    } catch (error: any) {
        console.error("❌ Erro ao listar usuários no banco via users.ts:", error);
        res.status(500).json({ message: "Erro ao buscar usuários", error: error.message });
    }
});

// Criar novo usuário estruturando a instância da classe de forma estrita
router.post("/", async (req: Request, res: Response) => {
    try {
        // Instancia uma nova classe limpa para evitar conflitos de inferência do TypeORM
        const novoUsuario = new Usuario();
        
        // Mescla as propriedades do req.body para dentro da instância
        repo.merge(novoUsuario, req.body);
        
        // Trata o booleano de primeiro acesso de forma estrita
        if (req.body.primeiroAcesso !== undefined) {
            novoUsuario.primeiroAcesso = req.body.primeiroAcesso === true || req.body.primeiroAcesso === 'true';
        }

        const salvo = await repo.save(novoUsuario);
        res.status(201).json(salvo);
    } catch (error: any) {
        console.error("❌ Erro ao cadastrar usuário via users.ts:", error);
        res.status(500).json({ message: "Erro ao salvar usuário", error: error.message });
    }
});

// Atualizar usuário existente
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const item = await repo.findOneBy({ id });
        
        if (!item) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        const atualizado = await repo.save(repo.merge(item, req.body));
        res.json(atualizado);
    } catch (error: any) {
        console.error("❌ Erro ao atualizar usuário via users.ts:", error.message);
        res.status(500).json({ message: "Erro ao atualizar usuário", error: error.message });
    }
});

// Deletar usuário do sistema
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await repo.delete(id);
        res.json({ success: true });
    } catch (error: any) {
        console.error("❌ Erro ao deletar usuário via users.ts:", error.message);
        res.status(500).json({ message: "Erro ao deletar usuário", error: error.message });
    }
});

export default router;