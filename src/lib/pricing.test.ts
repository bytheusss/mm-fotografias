import { describe, expect, it } from "vitest";
import { calculatePrice, unitPrice } from "./pricing";

describe("pricing", () => {
  it.each([[1, 15], [4, 15], [5, 12], [9, 12], [10, 10], [20, 10]])("cobra a faixa correta para %i fotos", (quantity, expected) => {
    expect(unitPrice(quantity)).toBe(expected);
  });

  it("calcula pacote de dez sem confiar no cliente", () => {
    expect(calculatePrice(10)).toEqual({ pricePerPhoto: 10, subtotal: 150, total: 100, economy: 50, label: "Pacote 10+ fotos aplicado (R$10 cada)" });
  });

  it("não produz totais negativos para carrinho vazio", () => {
    expect(calculatePrice(0).total).toBe(0);
  });
});
