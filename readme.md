<p align="center"><a href="https://laravel.com" target="_blank"><img width="150"src="https://laravel.com/laravel.png"></a></p>

<p align="center">
<a href="https://travis-ci.org/laravel/framework"><img src="https://travis-ci.org/laravel/framework.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://poser.pugx.org/laravel/framework/d/total.svg" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://poser.pugx.org/laravel/framework/v/stable.svg" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://poser.pugx.org/laravel/framework/license.svg" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable, creative experience to be truly fulfilling. Laravel attempts to take the pain out of development by easing common tasks used in the majority of web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, yet powerful, providing tools needed for large, robust applications. A superb combination of simplicity, elegance, and innovation give you tools you need to build any application with which you are tasked.

## Learning Laravel

Laravel has the most extensive and thorough documentation and video tutorial library of any modern web application framework. The [Laravel documentation](https://laravel.com/docs) is thorough, complete, and makes it a breeze to get started learning the framework.

If you're not in the mood to read, [Laracasts](https://laracasts.com) contains over 900 video tutorials on a range of topics including Laravel, modern PHP, unit testing, JavaScript, and more. Boost the skill level of yourself and your entire team by digging into our comprehensive video library.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](http://laravel.com/docs/contributions).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell at taylor@laravel.com. All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).



created by Tiago Moreira
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
