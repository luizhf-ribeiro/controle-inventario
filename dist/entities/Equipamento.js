"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Equipamento = void 0;
const typeorm_1 = require("typeorm");
let Equipamento = class Equipamento {
    id = 0;
    tipo = "";
    marca = "";
    modelo = "";
    patrimonio = "";
    serialNumber = "";
    status = "Disponível";
    usuarioResponsavel = "";
    // ADAPTAÇÃO: Nova coluna para controle físico
    localizacao = "";
    dataCadastro = new Date();
};
exports.Equipamento = Equipamento;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Equipamento.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Equipamento.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Equipamento.prototype, "marca", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Equipamento.prototype, "modelo", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Equipamento.prototype, "patrimonio", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Equipamento.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "Disponível" }),
    __metadata("design:type", String)
], Equipamento.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Equipamento.prototype, "usuarioResponsavel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Equipamento.prototype, "localizacao", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Equipamento.prototype, "dataCadastro", void 0);
exports.Equipamento = Equipamento = __decorate([
    (0, typeorm_1.Entity)("equipamentos")
], Equipamento);
