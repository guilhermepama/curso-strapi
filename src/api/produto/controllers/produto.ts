import { factories } from '@strapi/strapi';
import axios from 'axios';

export default factories.createCoreController('api::produto.produto', ({ strapi }) => ({
  async sincronizarProdutos(ctx) {
    try {
      // Log inicial para confirmar a execução da função
      console.log('Iniciando sincronização...');
  
      // Pegue o token da API
      const tinyApiToken = process.env.TINY_API_TOKEN;
      if (!tinyApiToken) {
        console.error('Token da API do Tiny não configurado.');
        return ctx.send({ error: 'Token da API não configurado.' }, 500);
      }
  
      // Crie a URL da API do Tiny
      const tinyApiUrl = `https://api.tiny.com.br/api2/produtos.pesquisa.php?token=${tinyApiToken}&situacao=A&formato=json`;
  
      // Log da URL para verificar se foi construída corretamente
      console.log('URL da API do Tiny:', tinyApiUrl);
  
      // Requisição à API
      const response = await axios.get(tinyApiUrl);
  
      // Log do retorno da API
      console.log('Retorno da API do Tiny:', response.data);
  
      // Verifique se há produtos no retorno
      const produtos = response.data.retorno?.produtos || [];
      if (produtos.length === 0) {
        console.log('Nenhum produto encontrado na API.');
        return ctx.send({ message: 'Nenhum produto encontrado.' });
      }
  
      // Iterar sobre os produtos e salvar no Strapi
      for (const item of produtos) {
        try {
          const produtoData = {
            nome: item.produto.nome,
            preco: item.produto.preco,
            estoque: item.produto.estoque || 0,
            codigo: item.produto.codigo,
          };
  
          console.log('Produto a ser salvo:', produtoData);
  
          await strapi.service('api::produto.produto').create({
            data: produtoData,
          });
  
          console.log(`Produto salvo com sucesso: ${produtoData.nome}`);
        } catch (error) {
          console.error('Erro ao salvar produto:', error);
        }
      }
  
      return ctx.send({ message: 'Sincronização concluída com sucesso!' });
    } catch (error) {
      console.error('Erro durante a sincronização:', error);
      return ctx.send({ error: 'Erro ao sincronizar produtos.' }, 500);
    }
  }    
}));
