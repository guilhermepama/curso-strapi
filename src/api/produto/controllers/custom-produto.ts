import { factories } from '@strapi/strapi';
import axios from 'axios';

export default factories.createCoreController('api::produto.produto', ({ strapi }) => ({
    async sincronizarProdutos(ctx) {
        try {
          const tinyApiToken = process.env.TINY_API_TOKEN;
          const tinyApiUrl = `https://api.tiny.com.br/api2/produtos.pesquisa.php?token=${tinyApiToken}&situacao=A&formato=json`;
      
          // Faz a requisição para a API do Tiny
          const response = await axios.get(tinyApiUrl);
      
          console.log('Resposta da API Tiny:', response.data);
      
          if (!response.data || !response.data.retorno || !response.data.retorno.produtos) {
            return ctx.send({ error: 'A API do Tiny não retornou produtos.' }, 400);
          }
      
          const produtos = response.data.retorno.produtos;
      
          for (const item of produtos) {
            const produto = item.produto;
      
            const produtoData = {
              nome: produto.nome,
              preco: parseFloat(produto.preco) || 0,
              estoque: parseInt(produto.estoque) || 0,
              codigo: produto.codigo,
              descricao: produto.descricao || '',
            };
      
            // Verifica se o produto já existe no banco de dados pelo código (SKU)
            const produtoExistente = await strapi.db.query('api::produto.produto').findOne({
              where: { codigo: produto.codigo },
            });
      
            if (produtoExistente) {
              console.log(`Produto já existe: ${produto.codigo} - Atualizando estoque e preço.`);
              // Atualiza o produto existente
              await strapi.db.query('api::produto.produto').update({
                where: { id: produtoExistente.id },
                data: {
                  preco: produtoData.preco,
                  estoque: produtoData.estoque,
                  descricao: produtoData.descricao,
                },
              });
            } else {
              console.log(`Novo produto encontrado: ${produto.codigo} - Criando no banco de dados.`);
              // Cria o produto se ele não existir
              await strapi.service('api::produto.produto').create({
                data: produtoData,
              });
            }
          }
      
          return ctx.send({ message: 'Sincronização concluída com sucesso!' });
        } catch (error) {
          console.error('Erro durante a sincronização:', error);
          return ctx.send({ error: 'Erro ao sincronizar produtos.' }, 500);
        }
      }      
}));
