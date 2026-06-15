import React from 'react';

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Recibo({ saleDetails }) {
  if (!saleDetails) return null;

  const { items, subtotal, desconto, total, troco, metodo, numeroVenda, data, atendente } = saleDetails;

  return (
    <div className="receipt-print-container bg-white text-black p-4 text-[12px] font-mono leading-tight w-[80mm] mx-auto">
      {/* Cabeçalho */}
      <div className="text-center mb-4 border-b border-black pb-2 border-dashed">
        <h2 className="font-bold text-[16px] uppercase mb-1">SMART PDV</h2>
        <p>Rua Exemplo, 123 - Centro</p>
        <p>CNPJ: 00.000.000/0001-00</p>
        <p>Tel: (11) 99999-9999</p>
        <br />
        <h3 className="font-bold">RECIBO DE VENDA</h3>
        <p>NÃO É DOCUMENTO FISCAL</p>
      </div>

      {/* Dados da Venda */}
      <div className="mb-2">
        <p>DATA: {new Date(data).toLocaleString('pt-BR')}</p>
        <p>CUPOM: #{String(numeroVenda).padStart(6, '0')}</p>
        <p>ATENDENTE: {atendente || 'Operador'}</p>
      </div>

      {/* Itens */}
      <div className="border-y border-black py-2 my-2 border-dashed">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="w-[10%]">QTD</th>
              <th className="w-[50%]">DESCRIÇÃO</th>
              <th className="w-[20%]">UN</th>
              <th className="w-[20%] text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="align-top pt-1">{item.qty}</td>
                <td className="align-top pt-1">{item.name}</td>
                <td className="align-top pt-1">{fmt(item.price)}</td>
                <td className="align-top pt-1 text-right">{fmt(item.price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totais */}
      <div className="space-y-1 mb-4 border-b border-black pb-2 border-dashed">
        {desconto > 0 && (
          <>
            <div className="flex justify-between text-[12px]">
              <span>SUBTOTAL</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span>DESCONTO</span>
              <span>-{fmt(desconto)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between font-bold text-[14px]">
          <span>TOTAL</span>
          <span>{fmt(total)}</span>
        </div>
        
        {metodo?.toLowerCase() === 'fiado' ? (
          <div className="text-center mt-2 border border-black p-1">
            <span className="font-bold">VENDA A PRAZO (FIADO)</span><br/>
            <span>VALOR RECEBIDO: R$ 0,00</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="uppercase">Pagamento: {metodo}</span>
              <span>{fmt(total + (troco > 0 ? troco : 0))}</span>
            </div>
            {troco > 0 && (
              <div className="flex justify-between">
                <span>TROCO</span>
                <span>{fmt(troco)}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Rodapé */}
      <div className="text-center">
        <p>OBRIGADO PELA PREFERÊNCIA!</p>
        <p className="mt-2 text-[10px]">Desenvolvido por Smart PDV</p>
      </div>
    </div>
  );
}
