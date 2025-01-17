export default {
    routes: [
      {
        method: 'GET', // Método HTTP
        path: '/produtos/sincronizar', // Caminho do endpoint
        handler: 'produto.sincronizarProdutos', // Nome do método no controlador
        config: {
          auth: false, // Define se a autenticação é necessária
          policies: [], // Políticas de acesso (se necessário)
          middlewares: [], // Middlewares personalizados (se necessário)
        },
      },
    ],
  };
  