## #TweetSearch by Tiago Moreira
Demo app to an interview exercise

16-11-2016

De forma a tornar a aplicação mais completa, aproveitei para adicionar algumas técnicas implementadas por mim noutros projectos.
Para além do que me foi pedido pela equipa da Thing Pink, adicionei um sistema de registo e login de utilizadores local. Após um
login válido, o utilizador poderá pesquisar tweets por uma ou mais hashtags e pode adicionala aos favoritos, que ficam gravados numa
base de dados indexada localmente.
A aplicação foi criada usando a framework de PHP Laravel 5.3, tendo já um conjunto de funcionalidades que permite o desenvolvimento local
mais simples. Alguma dúvida na instalação do mesmo ou para saber mais sobre a framework, podem consultar o seguinte link: https://laravel.com/docs/5.3


Após ter o servidor a correr, basta aceder á página através do browser.
- Para começar, o utilizador tem de se registar. Na barra de navegação, clique em "Sign Up"
- Escolha um username e password (não há nenhuma validação a ser feita pelo formulário)
- Após o registo, é logo redireccionado para a página de login. Faça então o login com as credenciais anteriormente adicionadas.
- Após o login, pode fazer a persquisa de tweets acedendo ao link 'Search' na barra de navegação
- Insira as hastags que pretender e prima 'search'
- Uma lista irá ser apresentada. Cada search retorna no máximo 20 tweets de uma vez. Para ver tweets mais antigos, basta premir o botão 'more'
  no fim da lista
- Aqui pode também adicionar tweets aos favoritos. Para isso basta clicar em cima dos que pretende. Irá ver a 'estrelinha' a mudar para diferenciar os
  seus favoritos
- Para ver os tweets que já adicionou aos favoritos, basta clicar no link 'Favorits' na barra de navegação. Aqui pode também eliminar os tweets
  que já não pretende. Para isso basta clicar neles que os mesmos desaparecem.
